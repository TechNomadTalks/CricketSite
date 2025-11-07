-- Migration: create_bookings_table
-- Created at: 1762241767

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    duration INTEGER NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, time_slot);

-- Create admin_users table for admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin users
INSERT INTO admin_users (email) VALUES 
    ('imraan@coas.co.za'),
    ('luke@l-inc.co.za')
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert bookings (public booking form)
CREATE POLICY "Allow public insert bookings" ON bookings
    FOR INSERT
    WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- RLS Policy: Only admins can view bookings
CREATE POLICY "Allow admin select bookings" ON bookings
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

-- RLS Policy: Only admins can update bookings
CREATE POLICY "Allow admin update bookings" ON bookings
    FOR UPDATE
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

-- RLS Policy: Only admins can delete bookings
CREATE POLICY "Allow admin delete bookings" ON bookings
    FOR DELETE
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

-- RLS Policy: Admins can view admin_users table
CREATE POLICY "Allow admin view admin_users" ON admin_users
    FOR SELECT
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.jwt()->>'email'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;