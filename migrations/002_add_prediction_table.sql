-- Add ML predictions table for smart drying recommendations

CREATE TABLE IF NOT EXISTS ml_predictions (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    cycle_id INTEGER REFERENCES drying_cycles(id) ON DELETE CASCADE,
    predicted_duration INTEGER, -- in minutes
    predicted_temperature DECIMAL(5,2),
    predicted_humidity DECIMAL(5,2),
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add energy consumption tracking
CREATE TABLE IF NOT EXISTS energy_consumption (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    cycle_id INTEGER REFERENCES drying_cycles(id) ON DELETE CASCADE,
    energy_used DECIMAL(8,3), -- in kWh
    cost DECIMAL(8,2), -- in currency units
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ml_predictions_device_id ON ml_predictions(device_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_cycle_id ON ml_predictions(cycle_id);
CREATE INDEX IF NOT EXISTS idx_energy_consumption_device_id ON energy_consumption(device_id);
CREATE INDEX IF NOT EXISTS idx_energy_consumption_timestamp ON energy_consumption(timestamp);
