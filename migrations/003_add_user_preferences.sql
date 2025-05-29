-- Add user preferences and settings

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light', -- 'light' or 'dark'
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    temperature_unit VARCHAR(10) DEFAULT 'celsius', -- 'celsius' or 'fahrenheit'
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add device settings
CREATE TABLE IF NOT EXISTS device_settings (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    auto_start BOOLEAN DEFAULT FALSE,
    eco_mode BOOLEAN DEFAULT TRUE,
    max_temperature DECIMAL(5,2) DEFAULT 60.0,
    default_cycle_type VARCHAR(100) DEFAULT 'cotton',
    maintenance_reminder BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create unique constraints
ALTER TABLE user_preferences ADD CONSTRAINT unique_user_preferences UNIQUE (user_id);
ALTER TABLE device_settings ADD CONSTRAINT unique_device_settings UNIQUE (device_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_device_settings_device_id ON device_settings(device_id);
