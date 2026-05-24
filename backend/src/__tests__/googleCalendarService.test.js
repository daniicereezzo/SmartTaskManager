// Mock googleapis calendar client
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: function () {
        return {
          setCredentials: () => {},
          generateAuthUrl: () => 'https://auth.url',
          getToken: async (code) => ({ tokens: { access_token: 'a', refresh_token: 'r' } })
        };
      }
    },
    calendar: () => ({
      events: {
        insert: async () => ({ data: { id: 'evt-1' } }),
        update: async () => ({ data: { id: 'evt-1' } }),
        delete: async () => ({})
      },
      eventsList: {},
      calendarList: { list: async () => ({ data: { items: [] } }) }
    })
  }
}));

// Mock models
jest.mock('../models', () => ({
  Task: {
    findByPk: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  }
}));

const GoogleCalendarService = require('../services/GoogleCalendarService');
const { Task, User } = require('../models');

describe('GoogleCalendarService basic flows', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getAuthUrl returns a url', () => {
    const authUrl = GoogleCalendarService.getAuthUrl();
    expect(typeof authUrl).toBe('string');
  });

  test('getTokensFromCode exchanges code', async () => {
    const tokens = await GoogleCalendarService.getTokensFromCode('code');
    expect(tokens).toHaveProperty('access_token');
  });

  test('createCalendarEvent throws when task not found', async () => {
    Task.findByPk.mockResolvedValue(null);
    await expect(GoogleCalendarService.createCalendarEvent(1, 999)).rejects.toThrow('Task not found');
  });

  test('createCalendarEvent updates task with event id', async () => {
    const fakeUser = { id: 1, timezone: 'UTC' };
    const fakeTask = {
      id: 10,
      title: 'T1',
      description: 'desc',
      startDate: '2025-10-24',
      startTime: '09:00:00',
      endDate: '2025-10-24',
      endTime: '10:00:00',
      alarmMinutesBefore: 15,
      taskType: 'mandatory',
      update: jest.fn(async function (data) { Object.assign(this, data); return this; }),
      user: fakeUser
    };

    Task.findByPk.mockResolvedValue(fakeTask);
    User.findByPk.mockResolvedValue(fakeUser);

    // Spy on getCalendarClient to return a mock calendar with events.insert
    const mockCalendar = {
      events: {
        insert: jest.fn(async () => ({ data: { id: 'evt-123' } })),
        update: jest.fn(async () => ({ data: { id: 'evt-123' } })),
        delete: jest.fn(async () => ({})),
        list: jest.fn(async () => ({ data: { items: [] } }))
      },
      calendarList: { list: jest.fn(async () => ({ data: { items: [] } })) }
    };

    jest.spyOn(GoogleCalendarService, 'getCalendarClient').mockResolvedValue(mockCalendar);

    // Also mock getUserAccessToken to avoid throwing
    jest.spyOn(GoogleCalendarService, 'getUserAccessToken').mockResolvedValue('token-abc');

    const res = await GoogleCalendarService.createCalendarEvent(1, 10);
    expect(res).toHaveProperty('id', 'evt-123');
    expect(fakeTask.update).toHaveBeenCalled();
  });

  test('updateCalendarEvent throws if missing event id', async () => {
    const taskNoEvent = { id: 11, googleCalendarEventId: null };
    Task.findByPk.mockResolvedValue(taskNoEvent);
    await expect(GoogleCalendarService.updateCalendarEvent(1, 11)).rejects.toThrow('Task or calendar event not found');
  });

  test('deleteCalendarEvent throws if missing event id', async () => {
    const taskNoEvent = { id: 12, googleCalendarEventId: null };
    Task.findByPk.mockResolvedValue(taskNoEvent);
    await expect(GoogleCalendarService.deleteCalendarEvent(1, 12)).rejects.toThrow('Task or calendar event not found');
  });

  test('syncTasksWithCalendar handles create/update flows', async () => {
    const fakeUser = { id: 2, timezone: 'UTC' };
    // task without event id -> create
    const t1 = { id: 21, userId: 2, googleCalendarEventId: null, update: jest.fn(), user: fakeUser };
    // task with event id -> update
    const t2 = { id: 22, userId: 2, googleCalendarEventId: 'evt-22', update: jest.fn(), user: fakeUser };

    Task.findAll = jest.fn().mockResolvedValue([t1, t2]);

    const mockCalendar = {
      events: {
        insert: jest.fn(async () => ({ data: { id: 'evt-new' } })),
        update: jest.fn(async () => ({ data: { id: 'evt-22' } }))
      },
      calendarList: { list: jest.fn(async () => ({ data: { items: [] } })) },
      events: { list: jest.fn(async () => ({ data: { items: [] } })) }
    };

    jest.spyOn(GoogleCalendarService, 'getCalendarClient').mockResolvedValue(mockCalendar);
    jest.spyOn(GoogleCalendarService, 'getUserAccessToken').mockResolvedValue('token-xyz');

    const results = await GoogleCalendarService.syncTasksWithCalendar(2);
    expect(results).toHaveProperty('created');
    expect(results).toHaveProperty('updated');
  });

  test('getCalendarList and getCalendarEvents return arrays', async () => {
    const mockCalendar = {
      calendarList: { list: jest.fn(async () => ({ data: { items: [{ id: 'cal-1' }] } })) },
      events: { list: jest.fn(async () => ({ data: { items: [{ id: 'evt-1' }] } })) }
    };
    jest.spyOn(GoogleCalendarService, 'getCalendarClient').mockResolvedValue(mockCalendar);
    jest.spyOn(GoogleCalendarService, 'getUserAccessToken').mockResolvedValue('tok');

    const list = await GoogleCalendarService.getCalendarList(1);
    expect(Array.isArray(list)).toBe(true);

    const events = await GoogleCalendarService.getCalendarEvents(1, new Date(), new Date());
    expect(Array.isArray(events)).toBe(true);
  });
});
