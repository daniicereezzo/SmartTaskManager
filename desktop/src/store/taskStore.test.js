// Mock TaskService to avoid importing axios which uses ESM
jest.mock('../services/TaskService', () => ({
  taskService: {
    getTasks: jest.fn()
  }
}));

import { act } from 'react-dom/test-utils';
const { useTaskStore } = require('./taskStore');
const { taskService } = require('../services/TaskService');

test('fetchTasks updates store', async () => {
  const fakeTasks = [{ id: 1, title: 'T' }];
  taskService.getTasks.mockResolvedValue(fakeTasks);

  const { fetchTasks } = useTaskStore.getState();
  await act(async () => {
    const res = await fetchTasks();
    expect(res).toEqual(fakeTasks);
  });

  const state = useTaskStore.getState();
  expect(state.tasks).toEqual(fakeTasks);
});

test('taskStore create/update/delete flows', async () => {
  const newTask = { id: 2, title: 'New' };
  const updatedTask = { id: 2, title: 'Updated' };

  taskService.createTask = jest.fn().mockResolvedValue(newTask);
  taskService.updateTask = jest.fn().mockResolvedValue(updatedTask);
  taskService.deleteTask = jest.fn().mockResolvedValue({ success: true });

  const { createTask, updateTask, deleteTask } = useTaskStore.getState();

  const created = await createTask({ title: 'New' });
  expect(created).toEqual(newTask);

  const updated = await updateTask(2, { title: 'Updated' });
  expect(updated).toEqual(updatedTask);

  await deleteTask(2);
  expect(taskService.deleteTask).toHaveBeenCalledWith(2);
  const stateAfterDelete = useTaskStore.getState();
  expect(stateAfterDelete.tasks.find(t => t.id === 2)).toBeUndefined();
});
