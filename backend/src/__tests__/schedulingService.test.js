const SchedulingService = require('../services/SchedulingService');

// Mock models used by the service
jest.mock('../models', () => ({
  Task: {
    findAll: jest.fn()
  },
  UserDailyPreference: {
    findAll: jest.fn()
  },
  UserEnergyPattern: {
    findAll: jest.fn()
  },
  ScheduledSlot: {
    findAll: jest.fn(),
    create: jest.fn()
  },
  TimeConflict: {
    create: jest.fn()
  }
}));

const { Task, UserDailyPreference, UserEnergyPattern, ScheduledSlot, TimeConflict } = require('../models');

describe('SchedulingService utils and basic scheduling', () => {
  const service = SchedulingService; // instance

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('timeToMinutes and minutesToTime are consistent', () => {
    expect(service.timeToMinutes('09:30')).toBe(570);
    expect(service.minutesToTime(570)).toBe('09:30');
  });

  test('calculateEnergyMatch returns expected values', () => {
    expect(service.calculateEnergyMatch('high', 'high')).toBe(1);
    expect(service.calculateEnergyMatch('high', 'medium')).toBe(0.5);
    expect(service.calculateEnergyMatch('high', 'low')).toBe(0);
  });

  test('getAvailableTimeSlots finds gaps around existing slots', () => {
    const date = new Date('2025-10-24');
    const dailyPref = { availableStartTime: '09:00', availableEndTime: '17:00' };
    const energyPatterns = [{ timeSlotStart: '09:00', timeSlotEnd: '12:00', energyLevel: 'high', productivityScore: 0.9 }];
    const existingSlots = [
      { scheduledDate: date.toISOString(), scheduledStartTime: '10:00', scheduledEndTime: '11:00' }
    ];

    const slots = service.getAvailableTimeSlots(date, dailyPref, energyPatterns, existingSlots, 60);
    // Should find a slot from 09:00 (before existing slot) and 11:00.. etc
    expect(slots.length).toBeGreaterThanOrEqual(1);
    expect(slots[0]).toHaveProperty('startTime');
    expect(slots[0]).toHaveProperty('endTime');
  });

  test('selectBestSlot chooses highest scoring slot', () => {
    const availableSlots = [
      { startTime: '09:00', endTime: '10:00', energyLevel: 'low', productivityScore: 0.3 },
      { startTime: '10:00', endTime: '11:00', energyLevel: 'high', productivityScore: 0.9 }
    ];
    const task = { workloadEnergy: 'high' };
    const best = service.selectBestSlot(availableSlots, task, []);
    expect(best.startTime).toBe('10:00');
  });

  test('scheduleTasks schedules tasks when possible', async () => {
    // Prepare mocks: one daily preference for date, one arrangable task
    UserDailyPreference.findAll.mockResolvedValue([{ dayOfWeek: new Date('2025-10-24').getDay(), availableStartTime: '09:00', availableEndTime: '17:00' }]);
    UserEnergyPattern.findAll.mockResolvedValue([]);
    Task.findAll.mockResolvedValue([
      { id: 1, userId: 1, taskType: 'arrangable', status: 'pending', startDate: '2025-10-24', endDate: '2025-10-24', priority: 1, durationMinutes: 60 }
    ]);
    ScheduledSlot.findAll.mockResolvedValue([]);
    ScheduledSlot.create.mockImplementation(async (data) => ({ toJSON: () => ({ ...data, id: 7 }), ...data }));

    const res = await service.scheduleTasks(1, new Date('2025-10-24'), new Date('2025-10-24'));
    expect(res).toHaveProperty('success', true);
    expect(Array.isArray(res.scheduledTasks)).toBe(true);
  }, 10000);
});
