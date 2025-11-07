// Cricket Arena Booking System - Main Application Logic

// Global State
let pitchesData = [];
let currentStep = 1;
let selectedPitch = null;
let bookingData = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    try {
        // Set minimum date for booking (only if on booking page)
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) {
            setMinimumDate();
        }
        
        // Load pitches
        await loadPitches();
        
        // Populate time slots (only if on booking page)
        const timeSlotSelect = document.getElementById('timeSlot');
        if (timeSlotSelect) {
            populateTimeSlots();
        }
        
        // Setup form handlers
        setupFormHandlers();
        
        // Setup smooth scrolling
        setupSmoothScroll();
        
        // Setup navbar scroll effect
        setupNavbarScroll();
        
        // Only show welcome toast on home/booking pages
        if (window.location.pathname.includes('index.html') || window.location.pathname.includes('booking.html') || window.location.pathname === '/') {
            showToast('Welcome to Action Soccer and Cricket Arena!', 'success');
        }
    } catch (error) {
        console.error('Initialization error:', error);
        // Don't show error toast for missing elements on other pages
    }
    
    // Always initialize chatbot on ALL pages (outside try-catch to ensure it runs)
    try {
        initializeChatbot();
    } catch (chatbotError) {
        console.error('Chatbot initialization error:', chatbotError);
    }
}

// Set minimum booking date
function setMinimumDate() {
    const dateInput = document.getElementById('bookingDate');
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + CONFIG.ARENA.BOOKING_WINDOW_DAYS);
    
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    dateInput.value = today.toISOString().split('T')[0];
}

// Load pitches - Single facility (Cricket Net Arena)
async function loadPitches() {
    try {
        // Use single facility data
        pitchesData = getMockPitches();
        renderPitches();
        populatePitchSelect();
    } catch (error) {
        console.error('Error loading pitches:', error);
        pitchesData = getMockPitches();
        renderPitches();
        populatePitchSelect();
    }
}

// Mock facility data for demonstration - SINGLE FACILITY
function getMockPitches() {
    return [
        {
            pitch_id: 1,
            name: 'Action Soccer and Cricket Arena',
            capacity: 16,
            hourly_rate: 500,
            description: 'A professional sports arena designed for both action soccer and cricket activities, featuring world-class facilities and equipment. Perfect for practice sessions, training, and competitive matches.',
            active_flag: true,
            features: [
                'Professional pitch section',
                'All-weather surface',
                'Safety netting',
                'Night lighting',
                'Equipment storage',
                'Soccer posts and goals',
                'Cricket stumps and bails',
                'Secure key access',
                'Professional lighting',
                'Suitable for up to 16 players'
            ]
        }
    ];
}

// Render pitches in the facilities section
function renderPitches() {
    const container = document.getElementById('pitchesContainer');
    
    // Only render if container exists (on facilities page)
    if (!container) return;
    
    if (pitchesData.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>No pitches available at the moment.</p></div>';
        return;
    }
    
    container.innerHTML = pitchesData.map(pitch => `
        <div class="col-md-6 col-lg-4">
            <div class="pitch-card">
                <div class="pitch-card-header">
                    <h3>${pitch.name}</h3>
                    <div class="pitch-price">
                        R ${pitch.hourly_rate}
                        <span class="pitch-price-period">/hour</span>
                    </div>
                </div>
                <div class="pitch-card-body">
                    <p>${pitch.description}</p>
                    <ul class="pitch-features">
                        ${(pitch.features || []).map(feature => `
                            <li>
                                <i class="bi bi-check-circle-fill"></i>
                                <span>${feature}</span>
                            </li>
                        `).join('')}
                        <li>
                            <i class="bi bi-people-fill"></i>
                            <span>Capacity: ${pitch.capacity} players</span>
                        </li>
                    </ul>
                    <a href="#booking" class="btn btn-primary w-100">
                        <i class="bi bi-calendar-check me-2"></i>Book This Pitch
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Populate pitch select dropdown
function populatePitchSelect() {
    const select = document.getElementById('pitchSelect');
    
    // Only populate if select exists (on booking page)
    if (!select) return;
    
    select.innerHTML = '<option value="">Select a pitch...</option>' +
        pitchesData.map(pitch => `
            <option value="${pitch.pitch_id}" data-rate="${pitch.hourly_rate}">
                ${pitch.name} - R ${pitch.hourly_rate}/hour
            </option>
        `).join('');
}

// Populate time slots
function populateTimeSlots() {
    const select = document.getElementById('timeSlot');
    
    // Only populate if select exists (on booking page)
    if (!select) return;
    
    select.innerHTML = '<option value="">Select time slot...</option>' +
        CONFIG.TIME_SLOTS.map(slot => `
            <option value="${slot.value}">${slot.label}</option>
        `).join('');
}

// Check availability - Placeholder (overridden by booking-supabase.js)
async function checkAvailability() {
    // This function is overridden by booking-supabase.js
    // Fallback behavior in case Supabase is not loaded
    const date = document.getElementById('bookingDate').value;
    const timeSlot = document.getElementById('timeSlot').value;
    
    if (!date || !timeSlot) {
        showToast('Please select date and time slot first.', 'warning');
        return;
    }
    
    showToast('Loading availability check...', 'info');
}

// Show availability status
function showAvailabilityStatus(available, message) {
    const statusDiv = document.getElementById('availabilityStatus');
    statusDiv.innerHTML = `
        <div class="alert alert-${available ? 'success' : 'warning'}">
            <i class="bi bi-${available ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
        </div>
    `;
}

// Setup form handlers
function setupFormHandlers() {
    const form = document.getElementById('bookingForm');
    if (!form) return;
    
    form.addEventListener('submit', handleFormSubmit);
    
    // Auto-calculate price when values change
    ['bookingDate', 'timeSlot', 'duration'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener('change', calculatePrice);
        }
    });
}

// Navigate to next step
function nextStep(step) {
    // Validate current step
    if (!validateStep(currentStep)) {
        return;
    }
    
    // Hide current step
    document.querySelector(`.booking-step[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('completed');
    
    // Show next step
    currentStep = step;
    document.querySelector(`.booking-step[data-step="${step}"]`).classList.add('active');
    document.querySelector(`.progress-step[data-step="${step}"]`).classList.add('active');
    
    // Update summary if moving to step 3
    if (step === 3) {
        updateBookingSummary();
    }
    
    // Scroll to top of booking section
    const bookingElement = document.getElementById('booking');
    if (bookingElement) {
        bookingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Navigate to previous step
function prevStep(step) {
    // Hide current step
    document.querySelector(`.booking-step[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');
    
    // Show previous step
    currentStep = step;
    document.querySelector(`.booking-step[data-step="${step}"]`).classList.add('active');
    document.querySelector(`.progress-step[data-step="${step}"]`).classList.add('active');
    document.querySelector(`.progress-step[data-step="${step}"]`).classList.remove('completed');
    
    // Scroll to top of booking section
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Validate step
function validateStep(step) {
    if (step === 1) {
        const date = document.getElementById('bookingDate').value;
        const timeSlot = document.getElementById('timeSlot').value;
        
        if (!date || !timeSlot) {
            showToast('Please fill in all required fields.', 'warning');
            return false;
        }
    } else if (step === 2) {
        const required = ['teamName', 'playersCount', 'contactName', 'contactPhone', 'contactEmail', 'partyType'];
        for (let id of required) {
            const value = document.getElementById(id).value;
            if (!value) {
                showToast('Please fill in all required fields.', 'warning');
                return false;
            }
        }
        
        // Validate email
        const email = document.getElementById('contactEmail').value;
        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address.', 'warning');
            return false;
        }
        
        // Validate phone
        const phone = document.getElementById('contactPhone').value;
        if (phone.length < 10) {
            showToast('Please enter a valid phone number.', 'warning');
            return false;
        }
    }
    
    return true;
}

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Calculate price
function calculatePrice() {
    const duration = parseInt(document.getElementById('duration').value) || 1;
    
    // Use the single facility rate
    const hourlyRate = 350; // Cricket Net Arena rate
    
    const subtotal = hourlyRate * duration;
    const vat = subtotal * CONFIG.ARENA.VAT_RATE;
    const total = subtotal + vat;
    
    // Store for later use
    bookingData.subtotal = subtotal;
    bookingData.vat = vat;
    bookingData.total = total;
    bookingData.hourlyRate = hourlyRate;
    bookingData.pitchId = 1; // Single facility ID
}

// Update booking summary
function updateBookingSummary() {
    const date = document.getElementById('bookingDate').value;
    const timeSlotValue = document.getElementById('timeSlot').value;
    const timeSlot = CONFIG.TIME_SLOTS.find(slot => slot.value === timeSlotValue);
    const duration = document.getElementById('duration').value;
    const pitchName = 'Cricket Net Arena';
    const teamName = document.getElementById('teamName').value;
    const playersCount = document.getElementById('playersCount').value;
    const contactName = document.getElementById('contactName').value;
    const contactPhone = document.getElementById('contactPhone').value;
    const contactEmail = document.getElementById('contactEmail').value;
    
    // Calculate price
    calculatePrice();
    
    // Update summary display
    document.getElementById('summaryDate').textContent = new Date(date + 'T00:00:00').toLocaleDateString('en-ZA', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const selectedSlot = CONFIG.TIME_SLOTS.find(slot => slot.value === timeSlotValue);
    document.getElementById('summaryTime').textContent = selectedSlot ? selectedSlot.label : timeSlotValue;
    document.getElementById('summaryDuration').textContent = `${duration} hour${duration > 1 ? 's' : ''}`;
    document.getElementById('summaryPitch').textContent = pitchName;
    document.getElementById('summaryTeam').textContent = teamName;
    document.getElementById('summaryPlayers').textContent = playersCount;
    document.getElementById('summaryContact').textContent = `${contactName} (${contactPhone}, ${contactEmail})`;
    
    document.getElementById('summarySubtotal').textContent = `R ${bookingData.subtotal.toFixed(2)}`;
    document.getElementById('summaryVat').textContent = `R ${bookingData.vat.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `R ${bookingData.total.toFixed(2)}`;
}

// Handle form submission - Placeholder (overridden by booking-supabase.js)
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateStep(3)) {
        return;
    }
    
    // This function is overridden by booking-supabase.js
    showToast('Submitting booking...', 'info');
}

// Redirect to PayFast for payment - Not used (bookings go through Supabase)
// PayFast integration removed - now using EFT banking
// Payment instructions are provided in the booking confirmation modal

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toastNotification');
    const toastBody = toast.querySelector('.toast-body');
    
    toastBody.textContent = message;
    
    // Add color based on type
    toast.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
    if (type === 'success') {
        toast.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
        toast.classList.add('bg-danger', 'text-white');
    } else if (type === 'warning') {
        toast.classList.add('bg-warning');
    } else {
        toast.classList.add('bg-info', 'text-white');
    }
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Show loading overlay
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Setup smooth scrolling
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Setup navbar scroll effect
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
        } else {
            navbar.style.boxShadow = '0 2px 15px rgba(0,0,0,0.1)';
        }
    });
    
    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}


// ==================== CHATBOT FUNCTIONALITY ====================

function initializeChatbot() {
    const chatbotHTML = `
        <div id="chatbot-container" class="chatbot-container">
            <!-- Chatbot Toggle Button -->
            <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Open Chat">
                <i class="bi bi-chat-dots-fill"></i>
                <span class="chatbot-badge">?</span>
            </button>
            
            <!-- Chatbot Window -->
            <div id="chatbot-window" class="chatbot-window" style="display: none;">
                <div class="chatbot-header">
                    <div class="chatbot-header-content">
                        <i class="bi bi-robot"></i>
                        <h5>Cricket Arena Assistant</h5>
                    </div>
                    <button id="chatbot-close" class="chatbot-close-btn">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <div class="chatbot-body" id="chatbot-body">
                    <div class="chatbot-message bot-message">
                        <div class="message-avatar">
                            <i class="bi bi-robot"></i>
                        </div>
                        <div class="message-content">
                            <p>Hi! 👋 Welcome to Cricket Arena Port Shepstone!</p>
                            <p>I'm here to help answer your questions. Choose a topic below or type your question:</p>
                        </div>
                    </div>
                    
                    <div class="chatbot-quick-questions">
                        <button class="quick-question-btn" data-question="hours">
                            <i class="bi bi-clock"></i> Operating Hours
                        </button>
                        <button class="quick-question-btn" data-question="location">
                            <i class="bi bi-geo-alt"></i> Location & Directions
                        </button>
                        <button class="quick-question-btn" data-question="facilities">
                            <i class="bi bi-building"></i> Facilities & Pitches
                        </button>
                        <button class="quick-question-btn" data-question="pricing">
                            <i class="bi bi-cash"></i> Pricing & Payment
                        </button>
                        <button class="quick-question-btn" data-question="booking">
                            <i class="bi bi-calendar-check"></i> How to Book
                        </button>
                        <button class="quick-question-btn" data-question="capacity">
                            <i class="bi bi-people"></i> Capacity & Group Sizes
                        </button>
                        <button class="quick-question-btn" data-question="equipment">
                            <i class="bi bi-gear"></i> Equipment & Amenities
                        </button>
                    </div>
                </div>
                
                <div class="chatbot-footer">
                    <input type="text" id="chatbot-input" class="chatbot-input" placeholder="Type your question..." />
                    <button id="chatbot-send" class="chatbot-send-btn">
                        <i class="bi bi-send-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add chatbot HTML to body
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    
    // Initialize chatbot functionality
    setupChatbotHandlers();
}

function setupChatbotHandlers() {
    const toggle = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const window = document.getElementById('chatbot-window');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const quickQuestionBtns = document.querySelectorAll('.quick-question-btn');
    
    // Toggle chatbot
    toggle.addEventListener('click', () => {
        window.style.display = window.style.display === 'none' ? 'flex' : 'none';
        if (window.style.display === 'flex') {
            input.focus();
        }
    });
    
    // Close chatbot
    closeBtn.addEventListener('click', () => {
        window.style.display = 'none';
    });
    
    // Handle quick questions
    quickQuestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.dataset.question;
            handleQuickQuestion(question);
        });
    });
    
    // Handle send message
    sendBtn.addEventListener('click', () => sendMessage());
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Analyze message and respond
    setTimeout(() => {
        const response = generateResponse(message);
        addMessage(response, 'bot');
    }, 500);
}

function handleQuickQuestion(questionType) {
    const responses = {
        hours: `
            <strong>🕐 Operating Hours:</strong><br><br>
            Professional facilities available!<br><br>
            • Book anytime, day or night<br>
            • Perfect for early morning training or evening matches<br>
            • Floodlights available for night games<br><br>
            <em>Ready to book? <a href="booking.html">Click here</a></em>
        `,
        location: `
            <strong>📍 Location:</strong><br><br>
            <strong>Cricket Arena Port Shepstone</strong><br>
            13 Fairview Terrace<br>
            Port Shepstone, 4240<br>
            South Africa<br><br>
            📧 Email: <a href="mailto:luke@l-inc.co.za">luke@l-inc.co.za</a><br><br>
            <em>Need directions? <a href="contact.html">Visit our contact page</a></em>
        `,
        facilities: `
            <strong>🏏 Our Facility:</strong><br><br>
            <strong>Cricket Net Arena</strong> - R 350/hour<br><br>
            ✅ Large net area with professional pitch section<br>
            ✅ All-weather surface<br>
            ✅ Safety netting & night lighting<br>
            ✅ Equipment storage available<br>
            ✅ Professional lighting<br>
            ✅ Suitable for up to 30 players<br><br>
            <em>Perfect for practice sessions, training, and matches!</em><br>
            <a href="facilities.html">View full details</a>
        `,
        pricing: `
            <strong>💰 Pricing & Payment:</strong><br><br>
            <strong>Hourly Rate:</strong><br>
            • Cricket Net Arena: R 350/hour<br><br>
            <strong>Payment:</strong><br>
            • Payment via EFT (Electronic Funds Transfer)<br>
            • Banking details provided after booking<br>
            • Confirmation sent once payment verified<br><br>
            <em>Book from 1-8 hours per session</em><br>
            <a href="pricing.html">See pricing details</a>
        `,
        booking: `
            <strong>📅 How to Book:</strong><br><br>
            <strong>3 Easy Steps:</strong><br><br>
            1️⃣ <strong>Select Date & Time</strong><br>
            • Choose your preferred date and time slot<br>
            • Check real-time availability<br><br>
            2️⃣ <strong>Team Details</strong><br>
            • Enter team name, number of players, contact info<br><br>
            3️⃣ <strong>Review & Pay</strong><br>
            • Review your booking details<br>
            • Receive banking details for EFT payment<br>
            • Get confirmation after payment verification!<br><br>
            <a href="booking.html" class="btn btn-primary btn-sm mt-2">
                <i class="bi bi-calendar-check me-1"></i>Book Now
            </a>
        `,
        capacity: `
            <strong>👥 Capacity & Group Sizes:</strong><br><br>
            <strong>Our facility accommodates up to 30 players</strong><br><br>
            Perfect for:<br>
            • Full team practices (11+ players)<br>
            • Multi-team training sessions<br>
            • Tournaments and competitions<br>
            • Social cricket matches<br>
            • Coaching camps<br><br>
            <em>We welcome groups of all sizes!</em><br>
            Minimum booking: 1 player<br>
            Maximum capacity: 30 players
        `,
        equipment: `
            <strong>⚙️ Equipment & Amenities:</strong><br><br>
            <strong>What's Included:</strong><br>
            ✅ Professional wickets<br>
            ✅ Boundary markers<br>
            ✅ Sight screens<br>
            ✅ Floodlights for night play<br>
            ✅ Safety netting<br>
            ✅ Bowling machines (nets area)<br>
            ✅ Equipment storage<br>
            ✅ Changing facilities<br>
            ✅ Parking available<br><br>
            <strong>Bring your own:</strong><br>
            • Cricket bats, balls, and protective gear<br>
            • Team uniforms<br><br>
            <em>Everything else is ready for you!</em>
        `
    };
    
    const response = responses[questionType] || 'Sorry, I couldn\'t find information on that topic.';
    addMessage(response, 'bot');
}

function generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Hours
    if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('time') || lowerMessage.includes('when')) {
        return `Book your arena today! Our professional facilities and lighting make evening matches possible. <a href="booking.html">Ready to book?</a>`;
    }
    
    // Location
    if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('direction')) {
        return `We're located at <strong>13 Fairview Terrace, Port Shepstone, 4240</strong>. Email us at <a href="mailto:luke@l-inc.co.za">luke@l-inc.co.za</a> for directions! <a href="contact.html">Contact page</a>`;
    }
    
    // Pricing
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate') || lowerMessage.includes('fee') || lowerMessage.includes('how much')) {
        return `Our rate: <strong>Cricket Net Arena R 350/hr</strong>. All prices include VAT. <a href="pricing.html">View pricing details</a>`;
    }
    
    // Booking
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('how to')) {
        return `Booking is easy! Just 3 steps: <strong>1)</strong> Select date/time/pitch, <strong>2)</strong> Enter team details, <strong>3)</strong> Pay securely. <a href="booking.html" class="btn btn-primary btn-sm">Book Now</a>`;
    }
    
    // Capacity
    if (lowerMessage.includes('capacity') || lowerMessage.includes('how many') || lowerMessage.includes('player') || lowerMessage.includes('people')) {
        return `Our facility can accommodate up to <strong>30 players</strong>. Perfect for full teams, training sessions, or tournaments!`;
    }
    
    // Contact
    if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('call')) {
        return `Contact us at <a href="mailto:luke@l-inc.co.za"><strong>luke@l-inc.co.za</strong></a>. We're located at 13 Fairview Terrace, Port Shepstone, 4240. <a href="contact.html">Full contact details</a>`;
    }
    
    // Facilities
    if (lowerMessage.includes('pitch') || lowerMessage.includes('facilit') || lowerMessage.includes('turf') || lowerMessage.includes('net')) {
        return `We have <strong>Action Soccer and Cricket Arena</strong> (R 500/hr) - a professional sports arena with soccer and cricket facilities. Equipped with professional lighting! <a href="facilities.html">See details</a>`;
    }
    
    // Default response
    return `Thanks for your question! For detailed information, please:<br>
        • Check our <a href="facilities.html">Facilities</a><br>
        • View <a href="pricing.html">Pricing</a><br>
        • Visit our <a href="contact.html">Contact page</a><br>
        • Or email us at <a href="mailto:luke@l-inc.co.za">luke@l-inc.co.za</a><br><br>
        You can also click the buttons above for quick answers!`;
}

function addMessage(content, type) {
    const body = document.getElementById('chatbot-body');
    const messageHTML = type === 'user' 
        ? `
            <div class="chatbot-message user-message">
                <div class="message-content">
                    <p>${content}</p>
                </div>
                <div class="message-avatar">
                    <i class="bi bi-person-circle"></i>
                </div>
            </div>
        `
        : `
            <div class="chatbot-message bot-message">
                <div class="message-avatar">
                    <i class="bi bi-robot"></i>
                </div>
                <div class="message-content">
                    ${content}
                </div>
            </div>
        `;
    
    body.insertAdjacentHTML('beforeend', messageHTML);
    body.scrollTop = body.scrollHeight;
}


