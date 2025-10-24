const { sequelize, User, Task, TaskCategory, UserDailyPreference, ScheduledSlot, UserEnergyPattern } = require('../models');
require('dotenv').config();

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create sample user
    const user = await User.create({
      google_id: 'sample_google_id_123',
      email: 'demo@smarttaskmanager.com',
      name: 'Demo User',
      picture_url: 'https://via.placeholder.com/150',
      timezone: 'UTC',
      theme_preference: 'light'
    });
    
    console.log('✅ Created demo user');
    
    // Create sample task categories
    const categories = await Promise.all([
      TaskCategory.create({
        name: 'Work',
        color: '#3B82F6',
        user_id: user.id
      }),
      TaskCategory.create({
        name: 'Personal',
        color: '#10B981',
        user_id: user.id
      }),
      TaskCategory.create({
        name: 'Health',
        color: '#F59E0B',
        user_id: user.id
      }),
      TaskCategory.create({
        name: 'Learning',
        color: '#8B5CF6',
        user_id: user.id
      })
    ]);
    
    console.log('✅ Created task categories');
    
    // Create sample daily preferences
    const dailyPreferences = await Promise.all([
      // Monday
      UserDailyPreference.create({
        user_id: user.id,
        day_of_week: 1,
        available_start_time: '09:00',
        available_end_time: '17:00',
        energy_level: 'high'
      }),
      // Tuesday
      UserDailyPreference.create({
        user_id: user.id,
        day_of_week: 2,
        available_start_time: '09:00',
        available_end_time: '17:00',
        energy_level: 'high'
      }),
      // Wednesday
      UserDailyPreference.create({
        user_id: user.id,
        day_of_week: 3,
        available_start_time: '09:00',
        available_end_time: '17:00',
        energy_level: 'medium'
      }),
      // Thursday
      UserDailyPreference.create({
        user_id: user.id,
        day_of_week: 4,
        available_start_time: '09:00',
        available_end_time: '17:00',
        energy_level: 'medium'
      }),
      // Friday
      UserDailyPreference.create({
        user_id: user.id,
        day_of_week: 5,
        available_start_time: '09:00',
        available_end_time: '16:00',
        energy_level: 'low'
      }),
      // Saturday
      UserDailyPreference.create({
        user_id: user.id,
        day_of_week: 6,
        available_start_time: '10:00',
        available_end_time: '15:00',
        energy_level: 'medium'
      }),
      // Sunday
      UserDailyPreference.create({
        user_id: user.id,
        day_of_week: 0,
        available_start_time: '10:00',
        available_end_time: '15:00',
        energy_level: 'low'
      })
    ]);
    
    console.log('✅ Created daily preferences');
    
    // Create sample energy patterns
    const energyPatterns = await Promise.all([
      // Monday patterns
      UserEnergyPattern.create({
        user_id: user.id,
        day_of_week: 1,
        time_slot_start: '09:00',
        time_slot_end: '12:00',
        energy_level: 'high',
        productivity_score: 0.9
      }),
      UserEnergyPattern.create({
        user_id: user.id,
        day_of_week: 1,
        time_slot_start: '12:00',
        time_slot_end: '14:00',
        energy_level: 'low',
        productivity_score: 0.3
      }),
      UserEnergyPattern.create({
        user_id: user.id,
        day_of_week: 1,
        time_slot_start: '14:00',
        time_slot_end: '17:00',
        energy_level: 'medium',
        productivity_score: 0.7
      }),
      // Friday patterns (lower energy)
      UserEnergyPattern.create({
        user_id: user.id,
        day_of_week: 5,
        time_slot_start: '09:00',
        time_slot_end: '12:00',
        energy_level: 'medium',
        productivity_score: 0.6
      }),
      UserEnergyPattern.create({
        user_id: user.id,
        day_of_week: 5,
        time_slot_start: '12:00',
        time_slot_end: '16:00',
        energy_level: 'low',
        productivity_score: 0.4
      })
    ]);
    
    console.log('✅ Created energy patterns');
    
    // Create sample tasks
    const tasks = await Promise.all([
      // Work tasks
      Task.create({
        user_id: user.id,
        category_id: categories[0].id, // Work
        title: 'Team Meeting',
        description: 'Weekly team standup meeting',
        task_type: 'mandatory',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        start_time: '10:00',
        end_time: '11:00',
        duration_minutes: 60,
        priority: 1,
        workload_energy: 'medium',
        status: 'pending',
        alarm_minutes_before: 15,
        notification_enabled: true
      }),
      Task.create({
        user_id: user.id,
        category_id: categories[0].id, // Work
        title: 'Code Review',
        description: 'Review pull requests and provide feedback',
        task_type: 'desired',
        start_date: new Date(),
        end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        start_time: '14:00',
        end_time: '16:00',
        duration_minutes: 120,
        priority: 2,
        workload_energy: 'high',
        status: 'pending',
        alarm_minutes_before: 30,
        notification_enabled: true
      }),
      // Personal tasks
      Task.create({
        user_id: user.id,
        category_id: categories[1].id, // Personal
        title: 'Grocery Shopping',
        description: 'Buy groceries for the week',
        task_type: 'arrangable',
        start_date: new Date(),
        end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        duration_minutes: 90,
        priority: 3,
        workload_energy: 'low',
        status: 'pending',
        alarm_minutes_before: 60,
        notification_enabled: true
      }),
      // Health tasks
      Task.create({
        user_id: user.id,
        category_id: categories[2].id, // Health
        title: 'Morning Workout',
        description: '30-minute cardio session',
        task_type: 'desired',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        start_time: '07:00',
        end_time: '07:30',
        duration_minutes: 30,
        priority: 2,
        workload_energy: 'high',
        status: 'pending',
        alarm_minutes_before: 15,
        notification_enabled: true
      }),
      // Learning tasks
      Task.create({
        user_id: user.id,
        category_id: categories[3].id, // Learning
        title: 'Read Technical Book',
        description: 'Read chapter 5 of Clean Code',
        task_type: 'arrangable',
        start_date: new Date(),
        end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        duration_minutes: 60,
        priority: 4,
        workload_energy: 'medium',
        status: 'pending',
        alarm_minutes_before: 30,
        notification_enabled: true
      })
    ]);
    
    console.log('✅ Created sample tasks');
    
    // Create some scheduled slots for demonstration
    const scheduledSlots = await Promise.all([
      ScheduledSlot.create({
        task_id: tasks[0].id, // Team Meeting
        user_id: user.id,
        scheduled_date: new Date(),
        scheduled_start_time: '10:00',
        scheduled_end_time: '11:00',
        is_confirmed: true
      }),
      ScheduledSlot.create({
        task_id: tasks[3].id, // Morning Workout
        user_id: user.id,
        scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        scheduled_start_time: '07:00',
        scheduled_end_time: '07:30',
        is_confirmed: false
      })
    ]);
    
    console.log('✅ Created scheduled slots');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Sample data created:');
    console.log(`- 1 user (${user.email})`);
    console.log(`- ${categories.length} task categories`);
    console.log(`- ${dailyPreferences.length} daily preferences`);
    console.log(`- ${energyPatterns.length} energy patterns`);
    console.log(`- ${tasks.length} tasks`);
    console.log(`- ${scheduledSlots.length} scheduled slots`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🌱 Seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = seed;
