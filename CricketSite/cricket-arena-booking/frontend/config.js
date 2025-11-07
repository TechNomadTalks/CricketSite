// Configuration file for Cricket Arena Booking System
// Supabase Backend Configuration

const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://szrbczpxqogeggmihdbt.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmJjenB4cW9nZWdnbWloZGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzUwNjcsImV4cCI6MjA3NzgxMTA2N30.8zz1sPkHN9_liGBhPIqPYK6DOQQJKHV3XurhuF9ZKgQ',
    
    // Edge Function URLs
    EDGE_FUNCTIONS: {
        CHECK_AVAILABILITY: 'https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/check-availability',
        CREATE_BOOKING: 'https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/create-booking',
        GET_BOOKINGS: 'https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/get-bookings',
        UPDATE_BOOKING_STATUS: 'https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/update-booking-status',
        MODIFY_BOOKING: 'https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/modify-booking'
    },
    
    // Arena Settings
    ARENA: {
        NAME: 'Action Soccer and Cricket Arena',
        ADDRESS: 'Near 13 Fairview, Port Shepstone, KwaZulu-Natal',
        EMAIL: 'luke@l-inc.co.za',
        CAPACITY: 16, // Max players
        OPERATING_HOURS: 'By Booking', // Available by appointment
        HOURLY_RATE: 500, // R500 per hour
        MIN_BOOKING_HOURS: 1,
        MAX_BOOKING_HOURS: 10,
        BOOKING_WINDOW_DAYS: 365, // Can book up to 1 year ahead
        VAT_RATE: 0.15 // 15% VAT
    },
    
    // Time Slots (7:00 AM - 10:00 PM)
    TIME_SLOTS: [
        { value: '07:00', label: '7:00 AM - 8:00 AM' },
        { value: '08:00', label: '8:00 AM - 9:00 AM' },
        { value: '09:00', label: '9:00 AM - 10:00 AM' },
        { value: '10:00', label: '10:00 AM - 11:00 AM' },
        { value: '11:00', label: '11:00 AM - 12:00 PM' },
        { value: '12:00', label: '12:00 PM - 1:00 PM' },
        { value: '13:00', label: '1:00 PM - 2:00 PM' },
        { value: '14:00', label: '2:00 PM - 3:00 PM' },
        { value: '15:00', label: '3:00 PM - 4:00 PM' },
        { value: '16:00', label: '4:00 PM - 5:00 PM' },
        { value: '17:00', label: '5:00 PM - 6:00 PM' },
        { value: '18:00', label: '6:00 PM - 7:00 PM' },
        { value: '19:00', label: '7:00 PM - 8:00 PM' },
        { value: '20:00', label: '8:00 PM - 9:00 PM' },
        { value: '21:00', label: '9:00 PM - 10:00 PM' }
    ]
};

// Initialize Supabase client (will be available globally)
let supabase;

// Load Supabase client library and initialize
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load Supabase library from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            // Initialize Supabase client after library loads
            supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            console.log('Supabase client initialized successfully');
        };
        document.head.appendChild(script);
    } catch (error) {
        console.error('Failed to load Supabase client:', error);
    }
});
