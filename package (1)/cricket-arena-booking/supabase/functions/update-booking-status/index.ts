Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { booking_id, status } = await req.json();

        // Validate inputs
        if (!booking_id || !status) {
            throw new Error('booking_id and status are required');
        }

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            throw new Error('Invalid status. Must be: pending, confirmed, or cancelled');
        }

        // Get auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Verify user is authenticated
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid authentication token');
        }

        const userData = await userResponse.json();
        const userEmail = userData.email;

        // Check if user is admin
        const adminCheckResponse = await fetch(`${supabaseUrl}/rest/v1/admin_users?email=eq.${userEmail}&select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!adminCheckResponse.ok) {
            throw new Error('Failed to verify admin status');
        }

        const adminData = await adminCheckResponse.json();
        if (!adminData || adminData.length === 0) {
            return new Response(JSON.stringify({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'You do not have admin access'
                }
            }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Update booking status
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${booking_id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                status: status
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Failed to update booking: ${errorText}`);
        }

        const updatedBooking = await updateResponse.json();

        if (!updatedBooking || updatedBooking.length === 0) {
            throw new Error('Booking not found');
        }

        const booking = updatedBooking[0];

        // Log notification (in production, send actual email)
        console.log('Status update notification:', {
            to: booking.email,
            subject: `Booking ${status.toUpperCase()}: Cricket Arena`,
            booking_id: booking.id,
            customer: booking.customer_name,
            date: booking.booking_date,
            time: booking.time_slot,
            status: status
        });

        return new Response(JSON.stringify({
            data: {
                success: true,
                booking: booking,
                message: `Booking status updated to ${status}`
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Update booking status error:', error);

        const errorResponse = {
            error: {
                code: 'UPDATE_STATUS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
