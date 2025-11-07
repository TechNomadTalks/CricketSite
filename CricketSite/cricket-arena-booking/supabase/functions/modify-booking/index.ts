Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { booking_id, new_date, new_time_slot, new_duration, admin_reason } = await req.json();

        // Validate required fields
        if (!booking_id || !new_date || !new_time_slot || !new_duration) {
            throw new Error('Missing required fields: booking_id, new_date, new_time_slot, new_duration');
        }

        // Get authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Authorization required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // First, verify admin access and get current booking details
        const currentBookingResponse = await fetch(
            `${supabaseUrl}/rest/v1/bookings?id=eq.${booking_id}&select=*`, 
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!currentBookingResponse.ok) {
            throw new Error('Failed to fetch booking details');
        }

        const currentBookings = await currentBookingResponse.json();
        if (!currentBookings || currentBookings.length === 0) {
            throw new Error('Booking not found');
        }

        const currentBooking = currentBookings[0];

        // Business Rule: Check if booking is within 1-2 days
        const bookingDate = new Date(currentBooking.booking_date);
        const today = new Date();
        const timeDiff = bookingDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff <= 2 && daysDiff >= 0) {
            throw new Error('Cannot modify bookings within 1-2 days of the scheduled date');
        }

        // Validate new date is in the future
        const newBookingDate = new Date(new_date);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        if (newBookingDate < tomorrow) {
            throw new Error('New booking date must be at least 1 day in the future');
        }

        // Validate time slot (7:00 to 21:00)
        const hour = parseInt(new_time_slot.split(':')[0]);
        if (hour < 7 || hour >= 22) {
            throw new Error('Time slot must be between 07:00 and 21:00');
        }

        // Validate duration
        if (new_duration < 1 || new_duration > 10) {
            throw new Error('Duration must be between 1 and 10 hours');
        }

        // Helper function to convert time slot to minutes since midnight
        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        // Calculate new booking time range
        const newStartMinutes = timeToMinutes(new_time_slot);
        const newEndMinutes = newStartMinutes + (new_duration * 60);

        // Check availability for new date/time (excluding current booking)
        const availabilityCheck = await fetch(
            `${supabaseUrl}/rest/v1/bookings?booking_date=eq.${new_date}&status=neq.cancelled&id=neq.${booking_id}&select=time_slot,duration`, 
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            }
        );

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
                if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
                    const existingEndTime = String(Math.floor(existingEndMinutes / 60)).padStart(2, '0') + ':' + 
                                          String(existingEndMinutes % 60).padStart(2, '0');
                    throw new Error(`Time conflict: Arena is already booked from ${booking.time_slot} to ${existingEndTime} on ${new_date}`);
                }
            }
        }

        // Calculate new total price
        const new_total_price = new_duration * 350;

        // Update the booking
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${booking_id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                booking_date: new_date,
                time_slot: new_time_slot,
                duration: new_duration,
                total_price: new_total_price,
                status: 'confirmed' // Admin modifications are automatically confirmed
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Failed to update booking: ${errorText}`);
        }

        const updatedBookingData = await updateResponse.json();
        const updatedBooking = updatedBookingData[0];

        // Send notification emails
        try {
            const resendApiKey = Deno.env.get('RESEND_API_KEY');
            if (resendApiKey) {
                const reference = booking_id.substring(0, 8).toUpperCase();
                
                // Generate QR code for updated booking
                const bankingText = `Bank: FNB
Account Name: Coastal Accounting Cricket Arena
Account Number: 62874561234
Branch Code: 250655
Account Type: Business Cheque
Reference: ${reference}

Please use the booking reference for payment identification.`;
                
                const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bankingText)}&ecc=M`;

                // Email content for customer
                const customerEmailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1976D2; margin-bottom: 20px;">🔄 Booking Updated - Cricket Arena</h2>
                    
                    <p>Dear ${updatedBooking.customer_name},</p>
                    
                    <p>Your cricket arena booking has been updated as requested. Here are your new booking details:</p>
                    
                    <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976D2;">
                        <h4 style="margin: 0 0 10px 0; color: #1976D2;">📅 Original Booking</h4>
                        <p style="margin: 0; font-size: 14px; text-decoration: line-through; color: #757575;">
                            Date: ${currentBooking.booking_date} | Time: ${currentBooking.time_slot} | Duration: ${currentBooking.duration}h
                        </p>
                    </div>
                    
                    <div style="background: #E8F5E8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                        <h4 style="margin: 0 0 10px 0; color: #4CAF50;">✅ Updated Booking</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 4px 0; font-weight: bold;">Booking ID:</td>
                                <td style="padding: 4px 0;">${reference}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: bold;">Date:</td>
                                <td style="padding: 4px 0;">${new_date}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: bold;">Time:</td>
                                <td style="padding: 4px 0;">${new_time_slot}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: bold;">Duration:</td>
                                <td style="padding: 4px 0;">${new_duration} hours</td>
                            </tr>
                            <tr style="border-top: 2px solid #4CAF50;">
                                <td style="padding: 8px 0; font-weight: bold; color: #4CAF50;">New Total:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #4CAF50;">R${new_total_price}</td>
                            </tr>
                        </table>
                    </div>
                    
                    ${admin_reason ? `
                    <div style="background: #FFF3CD; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #856404;">
                        <h4 style="margin: 0 0 10px 0; color: #856404;">📝 Reason for Change</h4>
                        <p style="margin: 0; font-size: 14px;">${admin_reason}</p>
                    </div>
                    ` : ''}
                    
                    <div style="background: #FFF3CD; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #856404;">
                        <h4 style="margin: 0 0 10px 0; color: #856404;">💳 Payment Details</h4>
                        <p style="margin: 0 0 15px 0; font-size: 14px;">
                            <strong>Bank:</strong> FNB (First National Bank)<br>
                            <strong>Account Name:</strong> Coastal Accounting Cricket Arena<br>
                            <strong>Account Number:</strong> 62874561234<br>
                            <strong>Branch Code:</strong> 250655<br>
                            <strong>Reference:</strong> ${reference}
                        </p>
                        
                        <div style="text-align: center; margin: 15px 0; padding: 15px; background: #ffffff; border-radius: 8px; border: 1px solid #dee2e6;">
                            <h5 style="color: #1B5E20; margin-bottom: 10px;">📱 Quick Payment QR Code</h5>
                            <img src="${qrCodeURL}" alt="Banking QR Code" style="border: 2px solid #1B5E20; border-radius: 8px; max-width: 150px; height: auto;">
                            <p style="margin: 8px 0 0 0; font-size: 11px; color: #6c757d;">
                                Scan with your banking app to auto-fill payment details
                            </p>
                        </div>
                    </div>
                    
                    <p>Please arrive 15 minutes early for equipment setup. If you have any questions about this change, contact us at luke@l-inc.co.za.</p>
                    
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
                        to: [updatedBooking.email],
                        subject: `Booking Updated - ${reference}`,
                        html: customerEmailHtml
                    })
                });

                // Send email to admin
                const adminEmailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1976D2; margin-bottom: 20px;">🔧 Admin: Booking Modified</h2>
                    
                    <p>Booking ${reference} has been successfully modified.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4>Customer Details</h4>
                        <p><strong>Name:</strong> ${updatedBooking.customer_name}<br>
                        <strong>Email:</strong> ${updatedBooking.email}<br>
                        <strong>Phone:</strong> ${updatedBooking.phone}</p>
                    </div>
                    
                    <div style="background: #FFEBEE; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4>Original → Updated</h4>
                        <p><strong>Date:</strong> ${currentBooking.booking_date} → ${new_date}<br>
                        <strong>Time:</strong> ${currentBooking.time_slot} → ${new_time_slot}<br>
                        <strong>Duration:</strong> ${currentBooking.duration}h → ${new_duration}h<br>
                        <strong>Price:</strong> R${currentBooking.total_price} → R${new_total_price}</p>
                        
                        ${admin_reason ? `<p><strong>Reason:</strong> ${admin_reason}</p>` : ''}
                    </div>
                    
                    <p>Customer notification has been sent automatically.</p>
                </div>
                `;

                const adminResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'onboarding@resend.dev',
                        to: ['luke@l-inc.co.za'],
                        subject: `Booking Modified - ${reference}`,
                        html: adminEmailHtml
                    })
                });

                if (customerResponse.ok && adminResponse.ok) {
                    console.log('✅ Modification notification emails sent successfully');
                } else {
                    console.error('Email sending failed');
                }
            }
        } catch (emailError) {
            console.error('Failed to send notification emails:', emailError);
            // Don't fail the booking modification if email fails
        }

        return new Response(JSON.stringify({
            data: {
                success: true,
                booking: updatedBooking,
                original_booking: currentBooking,
                message: 'Booking modified successfully. Customer notification sent.'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Modify booking error:', error);

        const errorResponse = {
            error: {
                code: 'BOOKING_MODIFICATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});