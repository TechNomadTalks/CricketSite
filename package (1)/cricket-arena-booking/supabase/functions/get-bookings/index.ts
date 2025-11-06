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

        // Parse query parameters for filtering
        const url = new URL(req.url);
        const status = url.searchParams.get('status');
        const startDate = url.searchParams.get('start_date');
        const endDate = url.searchParams.get('end_date');

        // Build query
        let queryUrl = `${supabaseUrl}/rest/v1/bookings?select=*&order=booking_date.desc,time_slot.asc`;
        
        if (status && status !== 'all') {
            queryUrl += `&status=eq.${status}`;
        }
        if (startDate) {
            queryUrl += `&booking_date=gte.${startDate}`;
        }
        if (endDate) {
            queryUrl += `&booking_date=lte.${endDate}`;
        }

        // Fetch bookings
        const bookingsResponse = await fetch(queryUrl, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!bookingsResponse.ok) {
            const errorText = await bookingsResponse.text();
            throw new Error(`Failed to fetch bookings: ${errorText}`);
        }

        const bookings = await bookingsResponse.json();

        return new Response(JSON.stringify({
            data: {
                bookings: bookings,
                count: bookings.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get bookings error:', error);

        const errorResponse = {
            error: {
                code: 'GET_BOOKINGS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
