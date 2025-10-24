const { Op } = require('sequelize');
const { Task, UserDailyPreference, ScheduledSlot, UserEnergyPattern, TimeConflict } = require('../models');

class SchedulingService {
  constructor() {
    this.energyLevels = {
      low: 1,
      medium: 2,
      high: 3
    };
  }

  /**
   * Main scheduling function that organizes tasks automatically
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date for scheduling
   * @param {Date} endDate - End date for scheduling
   */
  async scheduleTasks(userId, startDate = new Date(), endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
    try {
      // Get user's daily preferences and energy patterns
      const dailyPreferences = await this.getUserDailyPreferences(userId);
      const energyPatterns = await this.getUserEnergyPatterns(userId);
      
      // Get all arrangable tasks that need scheduling
      const tasks = await this.getArrangableTasks(userId, startDate, endDate);
      
      // Sort tasks by priority and deadline
      const sortedTasks = this.sortTasksByPriority(tasks);
      
      // Get existing scheduled slots to avoid conflicts
      const existingSlots = await this.getExistingScheduledSlots(userId, startDate, endDate);
      
      // Schedule tasks
      const schedulingResults = await this.scheduleTasksInTimeframe(
        sortedTasks,
        dailyPreferences,
        energyPatterns,
        existingSlots,
        startDate,
        endDate
      );
      
      // Handle conflicts and time overruns
      await this.handleSchedulingConflicts(userId, schedulingResults.conflicts);
      
      return {
        success: true,
        scheduledTasks: schedulingResults.scheduled,
        conflicts: schedulingResults.conflicts,
        overruns: schedulingResults.overruns
      };
    } catch (error) {
      console.error('Error in scheduleTasks:', error);
      throw error;
    }
  }

  /**
   * Get user's daily preferences
   */
  async getUserDailyPreferences(userId) {
    const preferences = await UserDailyPreference.findAll({
      where: { userId }
    });
    
    return preferences.reduce((acc, pref) => {
      acc[pref.dayOfWeek] = pref;
      return acc;
    }, {});
  }

  /**
   * Get user's energy patterns
   */
  async getUserEnergyPatterns(userId) {
    const patterns = await UserEnergyPattern.findAll({
      where: { userId }
    });
    
    return patterns.reduce((acc, pattern) => {
      if (!acc[pattern.dayOfWeek]) {
        acc[pattern.dayOfWeek] = [];
      }
      acc[pattern.dayOfWeek].push(pattern);
      return acc;
    }, {});
  }

  /**
   * Get arrangable tasks that need scheduling
   */
  async getArrangableTasks(userId, startDate, endDate) {
    return await Task.findAll({
      where: {
        userId,
        taskType: 'arrangable',
        status: 'pending',
        startDate: {
          [Op.gte]: startDate
        },
        endDate: {
          [Op.lte]: endDate
        }
      },
      order: [['priority', 'ASC'], ['endDate', 'ASC']]
    });
  }

  /**
   * Sort tasks by priority and deadline
   */
  sortTasksByPriority(tasks) {
    return tasks.sort((a, b) => {
      // First by priority (1 = highest)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Then by deadline
      const aDeadline = new Date(a.endDate);
      const bDeadline = new Date(b.endDate);
      return aDeadline - bDeadline;
    });
  }

  /**
   * Get existing scheduled slots
   */
  async getExistingScheduledSlots(userId, startDate, endDate) {
    return await ScheduledSlot.findAll({
      where: {
        userId,
        scheduledDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{ model: Task, as: 'task' }]
    });
  }

  /**
   * Main scheduling algorithm
   */
  async scheduleTasksInTimeframe(tasks, dailyPreferences, energyPatterns, existingSlots, startDate, endDate) {
    const scheduled = [];
    const conflicts = [];
    const overruns = [];

    for (const task of tasks) {
      const taskStartDate = new Date(task.startDate);
      const taskEndDate = new Date(task.endDate);
      
      // Find the best time slot for this task
      const bestSlot = await this.findBestTimeSlot(
        task,
        taskStartDate,
        taskEndDate,
        dailyPreferences,
        energyPatterns,
        existingSlots
      );

      if (bestSlot) {
        // Create scheduled slot
        const scheduledSlot = await ScheduledSlot.create({
          taskId: task.id,
          userId: task.userId,
          scheduledDate: bestSlot.date,
          scheduledStartTime: bestSlot.startTime,
          scheduledEndTime: bestSlot.endTime,
          isConfirmed: false
        });

        scheduled.push(scheduledSlot);
        
        // Add to existing slots for future conflict checking
        existingSlots.push({
          ...scheduledSlot.toJSON(),
          task: task
        });
      } else {
        // Handle scheduling failure - create conflict
        const conflict = await this.createSchedulingConflict(
          task,
          taskStartDate,
          taskEndDate,
          dailyPreferences
        );
        conflicts.push(conflict);
      }
    }

    return { scheduled, conflicts, overruns };
  }

  /**
   * Find the best time slot for a task
   */
  async findBestTimeSlot(task, startDate, endDate, dailyPreferences, energyPatterns, existingSlots) {
    const currentDate = new Date(startDate);
    const endSchedulingDate = new Date(endDate);
    
    while (currentDate <= endSchedulingDate) {
      const dayOfWeek = currentDate.getDay();
      const dailyPref = dailyPreferences[dayOfWeek];
      
      if (!dailyPref) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Get available time slots for this day
      const availableSlots = this.getAvailableTimeSlots(
        currentDate,
        dailyPref,
        energyPatterns[dayOfWeek] || [],
        existingSlots,
        task.durationMinutes
      );

      // Find the best slot based on energy level matching
      const bestSlot = this.selectBestSlot(availableSlots, task, energyPatterns[dayOfWeek] || []);
      
      if (bestSlot) {
        return {
          date: new Date(currentDate),
          startTime: bestSlot.startTime,
          endTime: bestSlot.endTime
        };
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return null;
  }

  /**
   * Get available time slots for a specific day
   */
  getAvailableTimeSlots(date, dailyPref, energyPatterns, existingSlots, durationMinutes) {
    const slots = [];
    const daySlots = existingSlots.filter(slot => 
      new Date(slot.scheduledDate).toDateString() === date.toDateString()
    );

    // Convert time strings to minutes for easier calculation
    const availableStart = this.timeToMinutes(dailyPref.availableStartTime);
    const availableEnd = this.timeToMinutes(dailyPref.availableEndTime);
    
    // Sort existing slots by start time
    daySlots.sort((a, b) => this.timeToMinutes(a.scheduledStartTime) - this.timeToMinutes(b.scheduledStartTime));

    let currentTime = availableStart;
    
    for (const existingSlot of daySlots) {
      const slotStart = this.timeToMinutes(existingSlot.scheduledStartTime);
      const slotEnd = this.timeToMinutes(existingSlot.scheduledEndTime);
      
      // Check if there's a gap before this slot
      if (slotStart - currentTime >= durationMinutes) {
        slots.push({
          startTime: this.minutesToTime(currentTime),
          endTime: this.minutesToTime(currentTime + durationMinutes),
          energyLevel: this.getEnergyLevelForTime(currentTime, energyPatterns),
          productivityScore: this.getProductivityScoreForTime(currentTime, energyPatterns)
        });
      }
      
      currentTime = Math.max(currentTime, slotEnd);
    }

    // Check if there's time after the last slot
    if (availableEnd - currentTime >= durationMinutes) {
      slots.push({
        startTime: this.minutesToTime(currentTime),
        endTime: this.minutesToTime(currentTime + durationMinutes),
        energyLevel: this.getEnergyLevelForTime(currentTime, energyPatterns),
        productivityScore: this.getProductivityScoreForTime(currentTime, energyPatterns)
      });
    }

    return slots;
  }

  /**
   * Select the best slot based on energy level matching
   */
  selectBestSlot(availableSlots, task, energyPatterns) {
    if (availableSlots.length === 0) return null;

    // Score each slot based on energy level match and productivity
    const scoredSlots = availableSlots.map(slot => {
      let score = 0;
      
      // Energy level matching (higher is better)
      const energyMatch = this.calculateEnergyMatch(slot.energyLevel, task.workloadEnergy);
      score += energyMatch * 3;
      
      // Productivity score (higher is better)
      score += slot.productivityScore * 2;
      
      // Prefer earlier slots for same score
      score += (24 - this.timeToMinutes(slot.startTime)) / 24;
      
      return { ...slot, score };
    });

    // Return the highest scoring slot
    return scoredSlots.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  /**
   * Calculate energy level match score
   */
  calculateEnergyMatch(slotEnergy, taskEnergy) {
    const energyValues = { low: 1, medium: 2, high: 3 };
    const slotValue = energyValues[slotEnergy];
    const taskValue = energyValues[taskEnergy];
    
    // Perfect match = 1, adjacent = 0.5, opposite = 0
    const diff = Math.abs(slotValue - taskValue);
    return diff === 0 ? 1 : diff === 1 ? 0.5 : 0;
  }

  /**
   * Get energy level for a specific time
   */
  getEnergyLevelForTime(timeInMinutes, energyPatterns) {
    for (const pattern of energyPatterns) {
      const startMinutes = this.timeToMinutes(pattern.timeSlotStart);
      const endMinutes = this.timeToMinutes(pattern.timeSlotEnd);
      
      if (timeInMinutes >= startMinutes && timeInMinutes < endMinutes) {
        return pattern.energyLevel;
      }
    }
    return 'medium'; // Default
  }

  /**
   * Get productivity score for a specific time
   */
  getProductivityScoreForTime(timeInMinutes, energyPatterns) {
    for (const pattern of energyPatterns) {
      const startMinutes = this.timeToMinutes(pattern.timeSlotStart);
      const endMinutes = this.timeToMinutes(pattern.timeSlotEnd);
      
      if (timeInMinutes >= startMinutes && timeInMinutes < endMinutes) {
        return parseFloat(pattern.productivityScore);
      }
    }
    return 0.5; // Default
  }

  /**
   * Handle scheduling conflicts
   */
  async handleSchedulingConflicts(userId, conflicts) {
    for (const conflict of conflicts) {
      await TimeConflict.create({
        userId,
        conflictDate: conflict.date,
        conflictStartTime: conflict.startTime,
        conflictEndTime: conflict.endTime,
        conflictType: conflict.type,
        affectedTasks: conflict.affectedTasks,
        resolutionType: 'pending'
      });
    }
  }

  /**
   * Create a scheduling conflict record
   */
  async createSchedulingConflict(task, startDate, endDate, dailyPreferences) {
    return {
      taskId: task.id,
      date: startDate,
      startTime: '09:00',
      endTime: '17:00',
      type: 'insufficient_time',
      affectedTasks: [task.id],
      reason: 'No available time slots found within deadline'
    };
  }

  /**
   * Utility functions
   */
  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Handle time overruns - when tasks exceed available time
   */
  async handleTimeOverruns(userId, overruns) {
    // This would implement the logic for handling time overruns
    // as specified in the requirements
    for (const overrun of overruns) {
      // Notify user about time conflicts
      // Suggest modifications to desired tasks
      // Ask user to choose which days to exceed available time
    }
  }
}

module.exports = new SchedulingService();
