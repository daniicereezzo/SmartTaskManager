jest.mock('./ApiService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const { apiService } = require('./ApiService');
const { taskService } = require('./TaskService');

beforeEach(() => {
  jest.clearAllMocks();
});

test('getTasks calls apiService.get with filters', async () => {
  apiService.get.mockResolvedValue({ data: [{ id: 1 }] });
  const tasks = await taskService.getTasks({ type: 'a', status: 'b', priority: 'c', startDate: '2020-01-01', endDate: '2020-01-02', page: 2, limit: 5 });
  expect(apiService.get).toHaveBeenCalledWith(expect.stringContaining('/tasks?'));
  expect(tasks).toEqual([{ id: 1 }]);
});

test('getTask calls apiService.get', async () => {
  apiService.get.mockResolvedValue({ data: { id: 2 } });
  const task = await taskService.getTask(2);
  expect(apiService.get).toHaveBeenCalledWith('/tasks/2');
  expect(task).toEqual({ id: 2 });
});

test('createTask calls apiService.post', async () => {
  apiService.post.mockResolvedValue({ data: { id: 3 } });
  const task = await taskService.createTask({ title: 'T' });
  expect(apiService.post).toHaveBeenCalledWith('/tasks', { title: 'T' });
  expect(task).toEqual({ id: 3 });
});

test('updateTask calls apiService.put', async () => {
  apiService.put.mockResolvedValue({ data: { id: 4 } });
  const task = await taskService.updateTask(4, { title: 'U' });
  expect(apiService.put).toHaveBeenCalledWith('/tasks/4', { title: 'U' });
  expect(task).toEqual({ id: 4 });
});

test('deleteTask calls apiService.delete', async () => {
  apiService.delete.mockResolvedValue({ ok: true });
  const res = await taskService.deleteTask(5);
  expect(apiService.delete).toHaveBeenCalledWith('/tasks/5');
  expect(res).toEqual({ ok: true });
});

test('updateTaskStatus calls apiService.put', async () => {
  apiService.put.mockResolvedValue({ data: { id: 6, status: 'done' } });
  const task = await taskService.updateTaskStatus(6, 'done', 100);
  expect(apiService.put).toHaveBeenCalledWith('/tasks/6/status', { status: 'done', completionPercentage: 100 });
  expect(task).toEqual({ id: 6, status: 'done' });
});

test('scheduleTasks calls apiService.post', async () => {
  apiService.post.mockResolvedValue({ data: { scheduled: true } });
  const start = new Date('2020-01-01');
  const end = new Date('2020-01-02');
  const res = await taskService.scheduleTasks(start, end);
  expect(apiService.post).toHaveBeenCalledWith('/tasks/schedule', { startDate: '2020-01-01', endDate: '2020-01-02' });
  expect(res).toEqual({ scheduled: true });
});

test('getScheduledTasks calls apiService.get', async () => {
  apiService.get.mockResolvedValue({ data: [{ id: 7 }] });
  const res = await taskService.getScheduledTasks('2020-01-03');
  expect(apiService.get).toHaveBeenCalledWith('/tasks/scheduled/2020-01-03');
  expect(res).toEqual([{ id: 7 }]);
});

test('syncCalendar calls apiService.post', async () => {
  apiService.post.mockResolvedValue({ data: { synced: true } });
  const res = await taskService.syncCalendar();
  expect(apiService.post).toHaveBeenCalledWith('/tasks/sync-calendar');
  expect(res).toEqual({ synced: true });
});