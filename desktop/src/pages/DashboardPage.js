import React, { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { 
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { 
    tasks, 
    scheduledTasks, 
    isLoading, 
    fetchTasks, 
    fetchScheduledTasks 
  } = useTaskStore();

  useEffect(() => {
    // Fetch recent tasks
    fetchTasks({ limit: 10 });
    
    // Fetch today's scheduled tasks
    const today = new Date().toISOString().split('T')[0];
    fetchScheduledTasks(today);
  }, [fetchTasks, fetchScheduledTasks]);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = scheduledTasks[today] || [];
  
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => 
      t.status !== 'completed' && 
      new Date(t.endDate) < new Date()
    ).length
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );

  const TaskItem = ({ task, isScheduled = false }) => (
    <div className={`task-card ${isScheduled ? 'task-scheduled' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {task.title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {task.taskType} • Priority {task.priority}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            task.status === 'completed' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : task.status === 'in_progress'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {task.status}
          </span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Overview of your tasks and schedule
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={ClipboardDocumentListIcon}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={ClockIcon}
          color="yellow"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={ExclamationTriangleIcon}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Today's Schedule
            </h3>
            <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((scheduledTask) => (
                <TaskItem 
                  key={scheduledTask.id} 
                  task={scheduledTask.task} 
                  isScheduled={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No tasks scheduled
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your day is free! Add some tasks to get started.
              </p>
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Recent Tasks
            </h3>
            <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No tasks yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create your first task to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary">
            + New Task
          </button>
          <button className="btn-secondary">
            📅 View Calendar
          </button>
          <button className="btn-secondary">
            ⚙️ Schedule Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
