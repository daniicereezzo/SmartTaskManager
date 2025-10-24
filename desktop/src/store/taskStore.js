import { create } from 'zustand';
import { TaskService } from '../services/TaskService';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  scheduledTasks: {},
  isLoading: false,
  error: null,
  filters: {
    type: null,
    status: null,
    priority: null,
    dateRange: null
  },

  // Actions
  fetchTasks: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await TaskService.getTasks(filters);
      set({ tasks, isLoading: false });
      return tasks;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const task = await TaskService.getTask(taskId);
      set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? task : t),
        isLoading: false
      }));
      return task;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const task = await TaskService.createTask(taskData);
      set((state) => ({
        tasks: [...state.tasks, task],
        isLoading: false
      }));
      return task;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTask: async (taskId, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const task = await TaskService.updateTask(taskId, taskData);
      set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? task : t),
        isLoading: false
      }));
      return task;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      await TaskService.deleteTask(taskId);
      set((state) => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTaskStatus: async (taskId, status, completionPercentage) => {
    set({ isLoading: true, error: null });
    try {
      const task = await TaskService.updateTaskStatus(taskId, status, completionPercentage);
      set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? task : t),
        isLoading: false
      }));
      return task;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  scheduleTasks: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const result = await TaskService.scheduleTasks(startDate, endDate);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchScheduledTasks: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const scheduledTasks = await TaskService.getScheduledTasks(date);
      set((state) => ({
        scheduledTasks: {
          ...state.scheduledTasks,
          [date]: scheduledTasks
        },
        isLoading: false
      }));
      return scheduledTasks;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  syncCalendar: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await TaskService.syncCalendar();
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearFilters: () => {
    set({ filters: { type: null, status: null, priority: null, dateRange: null } });
  },

  clearError: () => {
    set({ error: null });
  }
}));
