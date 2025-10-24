import { apiService } from './ApiService';

class TaskService {
  async getTasks(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await apiService.get(`/tasks?${params.toString()}`);
    return response.data;
  }

  async getTask(taskId) {
    const response = await apiService.get(`/tasks/${taskId}`);
    return response.data;
  }

  async createTask(taskData) {
    const response = await apiService.post('/tasks', taskData);
    return response.data;
  }

  async updateTask(taskId, taskData) {
    const response = await apiService.put(`/tasks/${taskId}`, taskData);
    return response.data;
  }

  async deleteTask(taskId) {
    const response = await apiService.delete(`/tasks/${taskId}`);
    return response;
  }

  async updateTaskStatus(taskId, status, completionPercentage) {
    const response = await apiService.put(`/tasks/${taskId}/status`, {
      status,
      completionPercentage
    });
    return response.data;
  }

  async scheduleTasks(startDate, endDate) {
    const response = await apiService.post('/tasks/schedule', {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
    return response.data;
  }

  async getScheduledTasks(date) {
    const response = await apiService.get(`/tasks/scheduled/${date}`);
    return response.data;
  }

  async syncCalendar() {
    const response = await apiService.post('/tasks/sync-calendar');
    return response.data;
  }
}

export const TaskService = new TaskService();
