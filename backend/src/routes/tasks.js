const express = require('express');
const { Task, TaskCategory, ScheduledSlot } = require('../models');
const { authenticateToken, requireGoogleCalendar } = require('../middleware/auth');
const SchedulingService = require('../services/SchedulingService');
const GoogleCalendarService = require('../services/GoogleCalendarService');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /tasks
 * Get all tasks for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const { type, status, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const whereClause = { userId: req.user.id };
    
    if (type) whereClause.taskType = type;
    if (status) whereClause.status = status;
    if (startDate) whereClause.startDate = { [require('sequelize').Op.gte]: startDate };
    if (endDate) whereClause.endDate = { [require('sequelize').Op.lte]: endDate };

    const tasks = await Task.findAndCountAll({
      where: whereClause,
      include: [
        { model: TaskCategory, as: 'category' },
        { model: ScheduledSlot, as: 'scheduledSlots' }
      ],
      order: [['priority', 'ASC'], ['endDate', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: tasks.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: tasks.count,
        pages: Math.ceil(tasks.count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * GET /tasks/:id
 * Get a specific task
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        { model: TaskCategory, as: 'category' },
        { model: ScheduledSlot, as: 'scheduledSlots' }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

/**
 * POST /tasks
 * Create a new task
 */
router.post('/', async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.user.id
    };

    const task = await Task.create(taskData);

    // If task is mandatory or desired, create Google Calendar event
    if (task.taskType === 'mandatory' || task.taskType === 'desired') {
      try {
        await GoogleCalendarService.createCalendarEvent(req.user.id, task.id);
      } catch (error) {
        console.error('Error creating calendar event:', error);
        // Don't fail the task creation if calendar sync fails
      }
    }

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * PUT /tasks/:id
 * Update a task
 */
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.update(req.body);

    // Update Google Calendar event if it exists
    if (task.googleCalendarEventId) {
      try {
        await GoogleCalendarService.updateCalendarEvent(req.user.id, task.id);
      } catch (error) {
        console.error('Error updating calendar event:', error);
        // Don't fail the task update if calendar sync fails
      }
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * DELETE /tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Delete Google Calendar event if it exists
    if (task.googleCalendarEventId) {
      try {
        await GoogleCalendarService.deleteCalendarEvent(req.user.id, task.id);
      } catch (error) {
        console.error('Error deleting calendar event:', error);
        // Continue with task deletion even if calendar sync fails
      }
    }

    await task.destroy();

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

/**
 * POST /tasks/schedule
 * Trigger automatic scheduling for arrangable tasks
 */
router.post('/schedule', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    const result = await SchedulingService.scheduleTasks(
      req.user.id,
      startDate ? new Date(startDate) : new Date(),
      endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );

    res.json({
      success: true,
      message: 'Scheduling completed',
      data: result
    });
  } catch (error) {
    console.error('Error scheduling tasks:', error);
    res.status(500).json({ error: 'Failed to schedule tasks' });
  }
});

/**
 * GET /tasks/scheduled/:date
 * Get scheduled tasks for a specific date
 */
router.get('/scheduled/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    const scheduledSlots = await ScheduledSlot.findAll({
      where: {
        userId: req.user.id,
        scheduledDate: date
      },
      include: [
        { 
          model: Task, 
          as: 'task',
          include: [{ model: TaskCategory, as: 'category' }]
        }
      ],
      order: [['scheduledStartTime', 'ASC']]
    });

    res.json({ success: true, data: scheduledSlots });
  } catch (error) {
    console.error('Error fetching scheduled tasks:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled tasks' });
  }
});

/**
 * PUT /tasks/:id/status
 * Update task status
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { status, completionPercentage } = req.body;
    
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updateData = { status };
    if (completionPercentage !== undefined) {
      updateData.completionPercentage = completionPercentage;
    }
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await task.update(updateData);

    // Update Google Calendar event
    if (task.googleCalendarEventId) {
      try {
        await GoogleCalendarService.updateCalendarEvent(req.user.id, task.id);
      } catch (error) {
        console.error('Error updating calendar event:', error);
      }
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

/**
 * POST /tasks/sync-calendar
 * Sync all tasks with Google Calendar
 */
router.post('/sync-calendar', requireGoogleCalendar, async (req, res) => {
  try {
    const result = await GoogleCalendarService.syncTasksWithCalendar(req.user.id);
    
    res.json({
      success: true,
      message: 'Calendar sync completed',
      data: result
    });
  } catch (error) {
    console.error('Error syncing with calendar:', error);
    res.status(500).json({ error: 'Failed to sync with calendar' });
  }
});

module.exports = router;
