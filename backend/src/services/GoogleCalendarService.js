const { google } = require('googleapis');
const { Task, User } = require('../models');

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Get Google Calendar API client for a user
   */
  async getCalendarClient(userId) {
    const user = await User.findByPk(userId);
    if (!user || !user.googleId) {
      throw new Error('User not found or not connected to Google Calendar');
    }

    // In a real implementation, you would store and retrieve the user's access token
    // For now, we'll assume the token is stored in the user's session or database
    const accessToken = await this.getUserAccessToken(userId);
    
    this.oauth2Client.setCredentials({
      access_token: accessToken
    });

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Create a calendar event for a task
   */
  async createCalendarEvent(userId, taskId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const calendar = await this.getCalendarClient(userId);
      
      const event = {
        summary: task.title,
        description: task.description || '',
        start: {
          dateTime: this.formatDateTime(task.startDate, task.startTime),
          timeZone: task.user.timezone || 'UTC'
        },
        end: {
          dateTime: this.formatDateTime(task.endDate, task.endTime),
          timeZone: task.user.timezone || 'UTC'
        },
        reminders: {
          useDefault: false,
          overrides: [
            {
              method: 'popup',
              minutes: task.alarmMinutesBefore || 15
            }
          ]
        },
        colorId: this.getColorIdForTaskType(task.taskType),
        visibility: 'private'
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      // Update task with Google Calendar event ID
      await task.update({
        googleCalendarEventId: response.data.id,
        googleCalendarId: 'primary'
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Update a calendar event for a task
   */
  async updateCalendarEvent(userId, taskId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [{ model: User, as: 'user' }]
      });

      if (!task || !task.googleCalendarEventId) {
        throw new Error('Task or calendar event not found');
      }

      const calendar = await this.getCalendarClient(userId);
      
      const event = {
        summary: task.title,
        description: task.description || '',
        start: {
          dateTime: this.formatDateTime(task.startDate, task.startTime),
          timeZone: task.user.timezone || 'UTC'
        },
        end: {
          dateTime: this.formatDateTime(task.endDate, task.endTime),
          timeZone: task.user.timezone || 'UTC'
        },
        reminders: {
          useDefault: false,
          overrides: [
            {
              method: 'popup',
              minutes: task.alarmMinutesBefore || 15
            }
          ]
        },
        colorId: this.getColorIdForTaskType(task.taskType)
      };

      const response = await calendar.events.update({
        calendarId: task.googleCalendarId || 'primary',
        eventId: task.googleCalendarEventId,
        resource: event
      });

      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  /**
   * Delete a calendar event for a task
   */
  async deleteCalendarEvent(userId, taskId) {
    try {
      const task = await Task.findByPk(taskId);

      if (!task || !task.googleCalendarEventId) {
        throw new Error('Task or calendar event not found');
      }

      const calendar = await this.getCalendarClient(userId);
      
      await calendar.events.delete({
        calendarId: task.googleCalendarId || 'primary',
        eventId: task.googleCalendarEventId
      });

      // Remove Google Calendar references from task
      await task.update({
        googleCalendarEventId: null,
        googleCalendarId: null
      });

      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  /**
   * Sync tasks with Google Calendar
   */
  async syncTasksWithCalendar(userId) {
    try {
      const tasks = await Task.findAll({
        where: {
          userId,
          status: ['pending', 'in_progress']
        },
        include: [{ model: User, as: 'user' }]
      });

      const results = {
        created: 0,
        updated: 0,
        deleted: 0,
        errors: []
      };

      for (const task of tasks) {
        try {
          if (task.googleCalendarEventId) {
            // Update existing event
            await this.updateCalendarEvent(userId, task.id);
            results.updated++;
          } else {
            // Create new event
            await this.createCalendarEvent(userId, task.id);
            results.created++;
          }
        } catch (error) {
          results.errors.push({
            taskId: task.id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error syncing tasks with calendar:', error);
      throw error;
    }
  }

  /**
   * Get calendar events for a date range
   */
  async getCalendarEvents(userId, startDate, endDate) {
    try {
      const calendar = await this.getCalendarClient(userId);
      
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  /**
   * Get user's calendar list
   */
  async getCalendarList(userId) {
    try {
      const calendar = await this.getCalendarClient(userId);
      
      const response = await calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendar list:', error);
      throw error;
    }
  }

  /**
   * Utility functions
   */
  formatDateTime(date, time) {
    const dateStr = new Date(date).toISOString().split('T')[0];
    const timeStr = time || '09:00:00';
    return `${dateStr}T${timeStr}`;
  }

  getColorIdForTaskType(taskType) {
    const colorMap = {
      mandatory: '11', // Red
      desired: '5',    // Yellow
      arrangable: '10' // Green
    };
    return colorMap[taskType] || '1';
  }

  async getUserAccessToken(userId) {
    // In a real implementation, this would retrieve the stored access token
    // from the database or secure storage
    // For now, we'll return a placeholder
    throw new Error('User access token not implemented - requires OAuth flow');
  }

  /**
   * Get OAuth2 authorization URL
   */
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens from code:', error);
      throw error;
    }
  }
}

module.exports = new GoogleCalendarService();
