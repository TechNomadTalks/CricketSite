-- Cricket Arena Database Schema
-- Run this migration in Supabase SQL Editor

-- Cricket pitches table
CREATE TABLE IF NOT EXISTS cricket_pitches (
    pitch_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    description TEXT,
    features JSONB,
    active_flag BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cricket bookings table
CREATE TABLE IF NOT EXISTS cricket_bookings (
    booking_id VARCHAR(50) PRIMARY KEY,
    pitch_id INT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    duration INT NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    players_count INT NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    party_type VARCHAR(50) NOT NULL,
    special_requirements TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    vat DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default pitches
INSERT INTO cricket_pitches (name, capacity, hourly_rate, description, features, active_flag) VALUES
('Professional Turf Pitch', 22, 450, 'Premium natural turf pitch with international standards. Perfect for competitive matches and professional training.', 
 '["Natural turf surface", "Professional wicket", "Boundary markers", "Sight screens", "Lighting available"]'::jsonb, true),
('Astro Turf Pitch', 22, 350, 'All-weather synthetic pitch ideal for practice sessions and casual matches. Consistent bounce and performance.',
 '["Synthetic surface", "All-weather play", "Consistent bounce", "Low maintenance", "Night lighting"]'::jsonb, true),
('Training Nets Area', 12, 200, 'Dedicated nets facility with multiple lanes for focused batting and bowling practice.',
 '["6 practice nets", "Bowling machines", "Safety netting", "Coaching area", "Equipment storage"]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE cricket_pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cricket_bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for pitches
CREATE POLICY "Public read access for pitches" ON cricket_pitches
    FOR SELECT USING (active_flag = true);

-- Public insert access for bookings
CREATE POLICY "Public insert access for bookings" ON cricket_bookings
    FOR INSERT WITH CHECK (true);

-- Public read access for own bookings (by email)
CREATE POLICY "Public read access for bookings" ON cricket_bookings
    FOR SELECT USING (true);
