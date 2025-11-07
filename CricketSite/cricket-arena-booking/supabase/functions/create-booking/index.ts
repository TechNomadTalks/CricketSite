Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net"
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { customer_name, email, phone, booking_date, time_slot, duration } = await req.json();

        // SECURITY: Sanitize all inputs to prevent XSS attacks
        const sanitizeInput = (input) => {
            if (typeof input !== 'string') return input;
            return input
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;')
                .trim();
        };

        const sanitized_name = sanitizeInput(customer_name);
        const sanitized_email = sanitizeInput(email);
        const sanitized_phone = sanitizeInput(phone);

        // Validate required fields
        if (!sanitized_name || !sanitized_email || !sanitized_phone || !booking_date || !time_slot || !duration) {
            throw new Error('All fields are required: customer_name, email, phone, booking_date, time_slot, duration');
        }

        // Additional validation: Check for excessive length
        if (sanitized_name.length > 100) {
            throw new Error('Name is too long (max 100 characters)');
        }

        if (sanitized_email.length > 150) {
            throw new Error('Email is too long (max 150 characters)');
        }

        if (sanitized_phone.length > 20) {
            throw new Error('Phone is too long (max 20 characters)');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitized_email)) {
            throw new Error('Invalid email format');
        }

        // Validate phone format (South African format)
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(sanitized_phone.replace(/[\s\-\(\)]/g, ''))) {
            throw new Error('Invalid phone number format');
        }

        // Validate date is in the future
        const selectedDate = new Date(booking_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            throw new Error('Cannot book dates in the past');
        }

        // SECURITY FIX: Validate maximum booking horizon (1 year in advance)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        maxDate.setHours(23, 59, 59, 999);
        
        if (selectedDate > maxDate) {
            throw new Error('Cannot book more than 1 year in advance');
        }

        // Validate time slot (7:00 to 22:00)
        const hour = parseInt(time_slot.split(':')[0]);
        if (hour < 7 || hour >= 22) {
            throw new Error('Time slot must be between 07:00 and 22:00');
        }

        // Validate duration
        if (duration < 1 || duration > 10) {
            throw new Error('Duration must be between 1 and 10 hours');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // SECURITY FIX: Rate limiting - prevent spam bookings
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        const rateLimitCheck = await fetch(
            `${supabaseUrl}/rest/v1/bookings?email=eq.${encodeURIComponent(sanitized_email)}&created_at=gte.${oneHourAgo.toISOString()}&select=id`, 
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (rateLimitCheck.ok) {
            const recentBookings = await rateLimitCheck.json();
            if (recentBookings && recentBookings.length >= 5) {
                throw new Error('Too many booking requests. Please try again later.');
            }
        }

        // Helper function to convert time slot to minutes since midnight
        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        // Calculate requested booking time range
        const requestStartMinutes = timeToMinutes(time_slot);
        const requestEndMinutes = requestStartMinutes + (duration * 60);

        // Double-check availability with duration overlap detection
        const availabilityCheck = await fetch(`${supabaseUrl}/rest/v1/bookings?booking_date=eq.${booking_date}&status=neq.cancelled&select=time_slot,duration`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!availabilityCheck.ok) {
            throw new Error('Failed to check availability');
        }

        const existingBookings = await availabilityCheck.json();
        
        // Check for time overlaps
        if (existingBookings && existingBookings.length > 0) {
            for (const booking of existingBookings) {
                const existingStartMinutes = timeToMinutes(booking.time_slot);
                const existingEndMinutes = existingStartMinutes + (booking.duration * 60);
                
                // Check if time ranges overlap: start1 < end2 AND end1 > start2
                if (requestStartMinutes < existingEndMinutes && requestEndMinutes > existingStartMinutes) {
                    const existingEndTime = String(Math.floor(existingEndMinutes / 60)).padStart(2, '0') + ':' + 
                                          String(existingEndMinutes % 60).padStart(2, '0');
                    throw new Error(`Time conflict: Arena is booked from ${booking.time_slot} to ${existingEndTime}`);
                }
            }
        }

        // Calculate total price (R 350 per hour)
        const total_price = duration * 350;

        // Create booking with SANITIZED data
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/bookings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                customer_name: sanitized_name,
                email: sanitized_email,
                phone: sanitized_phone,
                booking_date,
                time_slot,
                duration,
                total_price,
                status: 'pending'
            })
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Failed to create booking: ${errorText}`);
        }

        const bookingData = await insertResponse.json();
        const booking = bookingData[0];

        // Send booking confirmation email via Resend
        try {
            const resendApiKey = Deno.env.get('RESEND_API_KEY');
            if (!resendApiKey) {
                console.error('Resend API key not configured');
                // Don't fail the booking if email fails
            } else {
                // Generate QR code for banking details
                const reference = booking.id.substring(0, 8).toUpperCase();
                const bankingText = `Bank: FNB
Account Name: Coastal Accounting Cricket Arena
Account Number: 62874561234
Branch Code: 250655
Account Type: Business Cheque
Reference: ${reference}

Please use the booking reference for payment identification.`;
                
                const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bankingText)}&ecc=M`;

                // Email content with QR code
                const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1B5E20; margin-bottom: 20px;">Cricket Arena Booking Confirmation</h2>
                    
                    <p>Dear ${sanitized_name},</p>
                    
                    <p>Your cricket arena booking has been confirmed! Here are your booking details:</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Booking ID:</td>
                                <td style="padding: 8px 0;">${reference}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                                <td style="padding: 8px 0;">${booking_date}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Time:</td>
                                <td style="padding: 8px 0;">${time_slot}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Duration:</td>
                                <td style="padding: 8px 0;">${duration} hours</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold;">Customer:</td>
                                <td style="padding: 8px 0;">${sanitized_name} (${sanitized_email})</td>
                            </tr>
                            <tr style="border-top: 2px solid #1B5E20;">
                                <td style="padding: 8px 0; font-weight: bold; color: #1B5E20;">Total:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #1B5E20;">R${total_price}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #FFF3CD; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #856404;">
                        <h4 style="margin: 0 0 10px 0; color: #856404;">Payment Details</h4>
                        <p style="margin: 0 0 15px 0; font-size: 14px;">
                            <strong>Bank:</strong> FNB (First National Bank)<br>
                            <strong>Account Name:</strong> Coastal Accounting Cricket Arena<br>
                            <strong>Account Number:</strong> 62874561234<br>
                            <strong>Branch Code:</strong> 250655<br>
                            <strong>Reference:</strong> ${reference}
                        </p>
                        
                        <!-- QR Code Section -->
                        <div style="text-align: center; margin: 15px 0; padding: 15px; background: #ffffff; border-radius: 8px; border: 1px solid #dee2e6;">
                            <h5 style="color: #1B5E20; margin-bottom: 10px;">📱 Quick Payment QR Code</h5>
                            <img src="${qrCodeURL}" alt="Banking QR Code" style="border: 2px solid #1B5E20; border-radius: 8px; max-width: 150px; height: auto;">
                            <p style="margin: 8px 0 0 0; font-size: 11px; color: #6c757d;">
                                Scan with your banking app to auto-fill payment details
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976D2;">
                        <h4 style="margin: 0 0 10px 0; color: #1976D2;">📋 Important Information</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                            <li>Please arrive 15 minutes early for equipment setup</li>
                            <li>Payment can be made via EFT before your session</li>
                            <li>Use booking reference <strong>${reference}</strong> for all payments</li>
                        </ul>
                    </div>
                    
                    <div style="background: #FFF8E1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F57C00;">
                        <h4 style="margin: 0 0 10px 0; color: #F57C00;">🔄 Need to Change Your Booking?</h4>
                        <p style="margin: 0; font-size: 14px;">
                            If you need to change your booking date or time, please email us at 
                            <strong>luke@l-inc.co.za</strong> with your requested changes. We will check 
                            availability and confirm if the change is possible.
                        </p>
                        <p style="margin: 8px 0 0 0; font-size: 12px; color: #E65100;">
                            <strong>Note:</strong> Bookings cannot be changed if they are within 1-2 days 
                            of the scheduled date.
                        </p>
                    </div>
                    
                    <p>Thank you for choosing our cricket arena!</p>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                        <p style="font-size: 12px; color: #6c757d; margin: 0;">
                            Cricket Net Arena | 13 Fairview Terrace, Port Shepstone, 4240
                        </p>
                    </div>
                </div>
                `;

                // Send email to customer
                const customerResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'onboarding@resend.dev',
                        to: [sanitized_email],
                        subject: `Booking Confirmation - ${booking.id.substring(0, 8).toUpperCase()}`,
                        html: emailHtml
                    })
                });

                // Send email to admin
                const adminResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'onboarding@resend.dev',
                        to: ['luke@l-inc.co.za'],
                        subject: `New Booking - ${booking.id.substring(0, 8).toUpperCase()}`,
                        html: emailHtml
                    })
                });

                if (customerResponse.ok && adminResponse.ok) {
                    console.log('✅ Confirmation emails sent successfully');
                } else {
                    const customerError = customerResponse.ok ? null : await customerResponse.text();
                    const adminError = adminResponse.ok ? null : await adminResponse.text();
                    console.error('Email sending failed:', { customerError, adminError });
                }
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Don't fail the booking if email fails
        }

        return new Response(JSON.stringify({
            data: {
                success: true,
                booking: {
                    id: booking.id,
                    customer_name: booking.customer_name,
                    email: booking.email,
                    phone: booking.phone,
                    booking_date: booking.booking_date,
                    time_slot: booking.time_slot,
                    duration: booking.duration,
                    total_price: booking.total_price,
                    status: booking.status,
                    created_at: booking.created_at
                },
                message: 'Booking created successfully! A confirmation has been sent to the arena management.'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Create booking error:', error);

        const errorResponse = {
            error: {
                code: 'BOOKING_CREATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
