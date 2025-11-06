Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { booking_date, time_slot, duration } = await req.json();

        if (!booking_date || !time_slot || !duration) {
            throw new Error('booking_date, time_slot, and duration are required');
        }

        // Validate date is in the future
        const selectedDate = new Date(booking_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            return new Response(JSON.stringify({
                data: {
                    available: false,
                    message: 'Cannot book dates in the past'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Validate time slot format (should be like "07:00", "08:00", etc.)
        if (!/^\d{2}:\d{2}$/.test(time_slot)) {
            throw new Error('Invalid time_slot format. Expected HH:MM');
        }

        // Validate time slot is within operating hours (7:00 to 22:00)
        const hour = parseInt(time_slot.split(':')[0]);
        if (hour < 7 || hour >= 22) {
            return new Response(JSON.stringify({
                data: {
                    available: false,
                    message: 'Time slot must be between 07:00 and 21:00 (9:00 PM)'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Helper function to convert time slot to minutes since midnight
        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        // Calculate requested booking time range
        const requestStartMinutes = timeToMinutes(time_slot);
        const requestEndMinutes = requestStartMinutes + (duration * 60);

        // Check for conflicting bookings on the same date (all non-cancelled bookings)
        const response = await fetch(`${supabaseUrl}/rest/v1/bookings?booking_date=eq.${booking_date}&status=neq.cancelled&select=time_slot,duration`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Database query failed: ${errorText}`);
        }

        const existingBookings = await response.json();

        // Check for time overlaps
        let hasConflict = false;
        let conflictMessage = '';

        if (existingBookings && existingBookings.length > 0) {
            for (const booking of existingBookings) {
                const existingStartMinutes = timeToMinutes(booking.time_slot);
                const existingEndMinutes = existingStartMinutes + (booking.duration * 60);
                
                // Check if time ranges overlap: start1 < end2 AND end1 > start2
                if (requestStartMinutes < existingEndMinutes && requestEndMinutes > existingStartMinutes) {
                    hasConflict = true;
                    const existingEndTime = String(Math.floor(existingEndMinutes / 60)).padStart(2, '0') + ':' + 
                                          String(existingEndMinutes % 60).padStart(2, '0');
                    conflictMessage = `Time conflict: Arena is booked from ${booking.time_slot} to ${existingEndTime}`;
                    break;
                }
            }
        }

        if (hasConflict) {
            return new Response(JSON.stringify({
                data: {
                    available: false,
                    message: conflictMessage
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            data: {
                available: true,
                message: 'Time slot is available'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Availability check error:', error);

        const errorResponse = {
            error: {
                code: 'AVAILABILITY_CHECK_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
