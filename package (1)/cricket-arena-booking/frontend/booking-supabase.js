// Supabase Backend Integration for Booking System
// This file overrides the booking functions to use Supabase Edge Functions

// Duration Slider Functionality
document.addEventListener('DOMContentLoaded', function() {
    const durationSlider = document.getElementById('duration');
    const durationDisplay = document.getElementById('durationDisplay');
    const estimatedCostElement = document.getElementById('estimatedCost');
    const ticks = document.querySelectorAll('.tick');
    
    // Update slider display and calculations
    function updateSlider() {
        const value = parseInt(durationSlider.value);
        const hourRate = 350;
        const estimatedCost = value * hourRate;
        
        // Update display
        durationDisplay.textContent = `${value} Hour${value > 1 ? 's' : ''}`;
        estimatedCostElement.textContent = `R ${estimatedCost.toLocaleString()}`;
        
        // Update tick marks
        ticks.forEach(tick => {
            const tickValue = parseInt(tick.dataset.value);
            if (tickValue === value) {
                tick.classList.add('active');
            } else {
                tick.classList.remove('active');
            }
        });
    }
    
    // Slider change event
    durationSlider.addEventListener('input', updateSlider);
    
    // Tick click events
    ticks.forEach(tick => {
        tick.addEventListener('click', function() {
            const value = parseInt(this.dataset.value);
            durationSlider.value = value;
            updateSlider();
        });
    });
    
    // Initialize slider
    updateSlider();
});

// Override checkAvailability to use Supabase
window.checkAvailability = async function() {
    const date = document.getElementById('bookingDate').value;
    const timeSlot = document.getElementById('timeSlot').value;
    const duration = document.getElementById('duration').value;
    
    if (!date || !timeSlot) {
        showToast('Please select date and time slot first.', 'warning');
        return;
    }
    
    try {
        showLoading();
        
        // Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('check-availability', {
            body: {
                booking_date: date,
                time_slot: timeSlot,
                duration: parseInt(duration)
            }
        });
        
        hideLoading();
        
        if (error) {
            throw error;
        }
        
        // Handle response
        if (data && data.data) {
            showAvailabilityStatus(data.data.available, data.data.message);
        } else if (data) {
            showAvailabilityStatus(data.available, data.message);
        }
    } catch (error) {
        console.error('Availability check error:', error);
        hideLoading();
        showToast('Error checking availability. Please try again.', 'error');
    }
};

// Override handleFormSubmit to use Supabase
async function handleFormSubmitSupabase(e) {
    e.preventDefault();
    
    if (!validateStep(3)) {
        return;
    }
    
    try {
        showLoading();
        
        const date = document.getElementById('bookingDate').value;
        const timeSlot = document.getElementById('timeSlot').value;
        const duration = parseInt(document.getElementById('duration').value);
        
        // Prepare booking data for Supabase
        const bookingPayload = {
            customer_name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            phone: document.getElementById('contactPhone').value,
            booking_date: date,
            time_slot: timeSlot,
            duration: duration
        };
        
        // Call Supabase Edge Function to create booking
        const { data, error } = await supabase.functions.invoke('create-booking', {
            body: bookingPayload
        });
        
        hideLoading();
        
        if (error) {
            throw error;
        }
        
        // Handle successful booking
        if (data && data.data && data.data.success) {
            const booking = data.data.booking;
            
            // Show success message
            showSuccessMessage(booking);
            
            // Reset form
            document.getElementById('bookingForm').reset();
            currentStep = 1;
            document.querySelectorAll('.booking-step').forEach(step => step.classList.remove('active'));
            document.querySelectorAll('.progress-step').forEach(step => {
                step.classList.remove('active', 'completed');
            });
            document.querySelector('.booking-step[data-step="1"]').classList.add('active');
            document.querySelector('.progress-step[data-step="1"]').classList.add('active');
        } else {
            throw new Error(data?.message || 'Booking failed');
        }
    } catch (error) {
        console.error('Booking submission error:', error);
        hideLoading();
        showToast(error.message || 'Error submitting booking. Please try again.', 'error');
    }
}

// SECURITY: Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    return String(text).replace(/[&<>"'\/]/g, (char) => map[char]);
}

// Show success message with XSS protection
function showSuccessMessage(booking) {
    // SECURITY FIX: Escape all user-provided data
    const modalHtml = `
        <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-check-circle-fill me-2"></i>
                            Booking Confirmed!
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <p class="lead">Your booking has been successfully created!</p>
                        <div class="alert alert-info mt-3">
                            <strong>Booking ID:</strong> ${escapeHtml(booking.id.substring(0, 8).toUpperCase())}<br>
                            <strong>Date:</strong> ${escapeHtml(booking.booking_date)}<br>
                            <strong>Time:</strong> ${escapeHtml(booking.time_slot)}<br>
                            <strong>Duration:</strong> ${escapeHtml(booking.duration)} hour(s)<br>
                            <strong>Total:</strong> R ${escapeHtml(booking.total_price)}
                        </div>
                        <div class="alert alert-warning mt-3">
                            <h6><strong>Payment Details - EFT Banking Information</strong></h6>
                            <div class="text-start" style="font-size: 0.95rem;">
                                <strong>Bank:</strong> NEDBANK<br>
                                <strong>Account Name:</strong> COASTAL ACCOUNTANCY (PTY) LTD T/A CRICKET NET ARENA<br>
                                <strong>Account Number:</strong> 1648146651<br>
                                <strong>Branch Code:</strong> 198765<br>
                                <strong>Account Type:</strong> Business Account<br>
                                <strong>Reference:</strong> ${escapeHtml(booking.id.substring(0, 8).toUpperCase())}<br>
                                <strong>Amount:</strong> R ${escapeHtml(booking.total_price)}
                            </div>
                        </div>
                        <p>A confirmation has been sent to the arena management at ${escapeHtml(CONFIG.ARENA.EMAIL)}.</p>
                        <p class="text-muted"><strong>Important:</strong> Please complete payment via EFT using the booking ID as reference. You will receive confirmation via email or phone once payment is verified.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('successModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    
    // Remove modal from DOM after it's hidden
    document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Replace form submit handler after page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Supabase to be initialized
    const checkSupabase = setInterval(() => {
        if (typeof supabase !== 'undefined' && supabase) {
            clearInterval(checkSupabase);
            
            // Replace form handler
            const form = document.getElementById('bookingForm');
            if (form) {
                form.removeEventListener('submit', handleFormSubmit);
                form.addEventListener('submit', handleFormSubmitSupabase);
                console.log('Booking form connected to Supabase backend');
            }
        }
    }, 100);
    
    // Stop checking after 5 seconds
    setTimeout(() => clearInterval(checkSupabase), 5000);
});
