-- Smart Task Manager Database Schema
-- PostgreSQL Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture_url TEXT,
    timezone VARCHAR(100) DEFAULT 'UTC',
    theme_preference VARCHAR(10) DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences for daily schedules
CREATE TABLE user_daily_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    available_start_time TIME NOT NULL,
    available_end_time TIME NOT NULL,
    energy_level VARCHAR(20) DEFAULT 'medium' CHECK (energy_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, day_of_week)
);

-- Task categories
CREATE TABLE task_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES task_categories(id) ON DELETE SET NULL,
    
    -- Basic task information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(20) NOT NULL CHECK (task_type IN ('mandatory', 'desired', 'arrangable')),
    
    -- Scheduling information
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER NOT NULL,
    
    -- Priority and energy
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5), -- 1 = highest priority
    workload_energy VARCHAR(20) DEFAULT 'medium' CHECK (workload_energy IN ('low', 'medium', 'high')),
    
    -- Google Calendar integration
    google_calendar_event_id VARCHAR(255),
    google_calendar_id VARCHAR(255),
    
    -- Recurring tasks
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB, -- Store recurrence rules
    
    -- Status and completion
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Alarms and notifications
    alarm_minutes_before INTEGER DEFAULT 15,
    notification_enabled BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scheduled_at TIMESTAMP WITH TIME ZONE, -- When the task was automatically scheduled
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Task dependencies
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, depends_on_task_id),
    CHECK (task_id != depends_on_task_id)
);

-- Scheduled time slots (for automatic scheduling)
CREATE TABLE scheduled_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_start_time TIME NOT NULL,
    scheduled_end_time TIME NOT NULL,
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Time conflicts and overrides
CREATE TABLE time_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conflict_date DATE NOT NULL,
    conflict_start_time TIME NOT NULL,
    conflict_end_time TIME NOT NULL,
    conflict_type VARCHAR(50) NOT NULL, -- 'exceeded_available_time', 'task_overlap', etc.
    affected_tasks UUID[] NOT NULL, -- Array of task IDs
    resolution_type VARCHAR(50), -- 'user_override', 'auto_resolve', 'pending'
    resolution_data JSONB, -- Store resolution details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- User energy patterns (for better scheduling)
CREATE TABLE user_energy_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    time_slot_start TIME NOT NULL,
    time_slot_end TIME NOT NULL,
    energy_level VARCHAR(20) NOT NULL CHECK (energy_level IN ('low', 'medium', 'high')),
    productivity_score DECIMAL(3,2) DEFAULT 0.5 CHECK (productivity_score >= 0 AND productivity_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sync status for offline capability
CREATE TABLE sync_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'task', 'preference', 'category'
    entity_id UUID NOT NULL,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'error')),
    device_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_dates ON tasks(start_date, end_date);
CREATE INDEX idx_tasks_type ON tasks(task_type);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_scheduled_slots_user_date ON scheduled_slots(user_id, scheduled_date);
CREATE INDEX idx_user_daily_preferences_user_day ON user_daily_preferences(user_id, day_of_week);
CREATE INDEX idx_sync_status_user ON sync_status(user_id);
CREATE INDEX idx_tasks_google_event_id ON tasks(google_calendar_event_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_daily_preferences_updated_at BEFORE UPDATE ON user_daily_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_slots_updated_at BEFORE UPDATE ON scheduled_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_energy_patterns_updated_at BEFORE UPDATE ON user_energy_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
