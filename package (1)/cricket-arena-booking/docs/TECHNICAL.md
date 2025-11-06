# Technical Documentation - Cricket Arena Booking System

This document provides technical details for developers who want to understand, modify, or extend the Cricket Arena Booking System.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Payment Integration](#payment-integration)
8. [Security](#security)
9. [Performance](#performance)
10. [Extending the System](#extending-the-system)

---

## System Architecture

### Overview

The Cricket Arena Booking System follows a serverless architecture pattern:

```
┌─────────────────┐
│   Frontend      │  HTML/CSS/JS + Bootstrap
│   (Static)      │  Hosted on any static host
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Google Apps    │  Node.js-like JavaScript
│  Script         │  Serverless execution
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google Sheets  │  NoSQL-like spreadsheet
│  (Database)     │  Real-time updates
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌──────────────┐ ┌──────────────┐
│   PayFast    │ │ Google Chat  │
│   (Payment)  │ │ (Notify)     │
└──────────────┘ └──────────────┘
```

### Request Flow

1. **Customer Interaction**:
   - User fills booking form
   - Frontend validates data
   - AJAX request to Google Apps Script

2. **Backend Processing**:
   - Apps Script receives request
   - Validates availability
   - Creates booking record
   - Returns booking ID

3. **Payment Processing**:
   - Frontend redirects to PayFast
   - Customer completes payment
   - PayFast sends IPN to backend
   - Backend updates booking status

4. **Confirmation**:
   - PayFast redirects to success page
   - Google Chat notification sent
   - Customer sees confirmation

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | - | Structure |
| CSS3 | - | Styling |
| JavaScript | ES6+ | Logic |
| Bootstrap | 5.3.2 | UI Framework |
| Bootstrap Icons | 1.11.1 | Icons |
| Google Fonts | - | Typography |

**No Build Process**: Pure vanilla JavaScript, no webpack/bundler needed

### Backend

| Technology | Purpose |
|------------|---------|
| Google Apps Script | Runtime environment |
| V8 Engine | JavaScript execution |
| Google Sheets API | Database operations |
| UrlFetchApp | HTTP requests |
| MailApp | Email sending (optional) |

### Third-Party Services

| Service | Purpose | Cost |
|---------|---------|------|
| Google Apps Script | Backend hosting | Free (quota limits) |
| Google Sheets | Database | Free |
| PayFast | Payment processing | 2.9% + R2 per transaction |
| Google Chat | Notifications | Free (with workspace) |

---

## Frontend Architecture

### File Structure

```
frontend/
├── index.html              # Main page
├── styles.css              # All styles
├── app.js                  # Application logic
├── config.js               # Configuration
├── payment-success.html    # Success page
└── payment-cancel.html     # Cancel page
```

### Key Components

#### 1. Booking Form State Machine

```javascript
// State transitions
States: [1, 2, 3]  // Step 1, 2, 3

// Transitions
Step 1 → Step 2: nextStep(2)  // After validation
Step 2 → Step 3: nextStep(3)  // After validation
Step 3 → Step 2: prevStep(2)  // Back button
```

#### 2. Data Flow

```javascript
// User Input → Validation → State → API → Response → UI Update

// Example: Availability Check
User selects date/time
  ↓
validateStep(1)
  ↓
checkAvailability()
  ↓
fetch(API_URL + '?action=checkAvailability')
  ↓
Backend checks database
  ↓
Response: { success: true, available: true }
  ↓
showAvailabilityStatus(true, message)
  ↓
User can proceed
```

### JavaScript Modules

#### config.js
- Configuration constants
- No dependencies
- Pure data, no functions

#### app.js
Main application logic:

```javascript
// Initialization
initializeApp()
  ├─ setMinimumDate()
  ├─ loadPitches()
  ├─ populateTimeSlots()
  ├─ setupFormHandlers()
  ├─ setupSmoothScroll()
  └─ setupNavbarScroll()

// Core Functions
├─ loadPitches()          // Fetch pitches from API
├─ checkAvailability()    // Verify slot available
├─ nextStep()             // Navigation
├─ prevStep()             // Navigation
├─ validateStep()         // Form validation
├─ calculatePrice()       // Price calculation
├─ updateBookingSummary() // Review display
├─ handleFormSubmit()     // Form submission
└─ redirectToPayFast()    // Payment redirect
```

### CSS Architecture

#### Design System

```css
:root {
    /* Colors */
    --primary-green: #1B5E20;
    --primary-gold: #FFC107;
    --accent-red: #E74C3C;
    --accent-blue: #2196F3;
    
    /* Spacing */
    /* Uses Bootstrap's spacing system */
    
    /* Typography */
    /* font-family: 'Poppins' (headings) */
    /* font-family: 'Inter' (body) */
}
```

#### Component Structure

```
Global Styles
├─ Reset & Base
├─ Typography
└─ Utilities

Layout Components
├─ Navigation
├─ Hero Section
├─ Sections
└─ Footer

UI Components
├─ Buttons
├─ Forms
├─ Cards
├─ Modals
└─ Toasts

Responsive
└─ Media Queries (@media)
```

---

## Backend Architecture

### Google Apps Script Structure

```javascript
// Entry Points
doGet(e)   // GET requests
doPost(e)  // POST requests

// Core Functions
├─ getPitches()
├─ getTimeSlots()
├─ checkAvailability()
├─ createBooking()
├─ updateBookingPaymentStatus()
└─ handlePayFastNotification()

// Helper Functions
├─ getSpreadsheet()
├─ getSheet()
├─ initializeSheet()
├─ generateBookingId()
├─ sendChatNotification()
└─ jsonResponse()
```

### Request Handling

```javascript
// GET Request Flow
doGet(e)
  ↓
Parse e.parameter.action
  ↓
Switch on action
  ├─ 'getPitches' → getPitches()
  ├─ 'getTimeSlots' → getTimeSlots()
  └─ 'payfast_notify' → handlePayFastNotification()
  ↓
jsonResponse(result)

// POST Request Flow
doPost(e)
  ↓
JSON.parse(e.postData.contents)
  ↓
Switch on action
  ├─ 'checkAvailability' → checkAvailability()
  └─ 'createBooking' → createBooking()
  ↓
jsonResponse(result)
```

### Error Handling

```javascript
try {
    // Operation
    const result = someOperation();
    return jsonResponse({ success: true, data: result });
} catch (error) {
    Logger.log('Error: ' + error.toString());
    return jsonResponse({ 
        success: false, 
        message: error.toString() 
    });
}
```

---

## Database Schema

### Google Sheets as Database

Each sheet represents a table:

#### Bookings Sheet

```
Row 1 (Headers):
booking_id | date | time_slot | duration | team_name | players_count | 
contact_name | contact_phone | contact_email | party_type | pitch_id | 
price | status | timestamp | payment_status | special_requirements

Data Types:
- booking_id: String (e.g., "BK1730678912345123")
- date: String (ISO format: "2025-11-10")
- time_slot: String (e.g., "10:00 AM - 11:00 AM")
- duration: Number
- team_name: String
- players_count: Number
- contact_name: String
- contact_phone: String
- contact_email: String
- party_type: String (enum)
- pitch_id: Number
- price: Number (decimal)
- status: String (enum: pending|confirmed|cancelled)
- timestamp: String (ISO format)
- payment_status: String (enum: pending|paid|refunded)
- special_requirements: String (optional)
```

#### Pitches Sheet

```
Row 1 (Headers):
pitch_id | name | capacity | hourly_rate | description | active_flag

Data Types:
- pitch_id: Number (primary key)
- name: String
- capacity: Number
- hourly_rate: Number (decimal)
- description: String
- active_flag: Boolean
```

#### Transactions Sheet

```
Row 1 (Headers):
transaction_id | booking_id | payfast_transaction_id | amount | 
status | timestamp | payment_data

Data Types:
- transaction_id: String
- booking_id: String (foreign key)
- payfast_transaction_id: String
- amount: Number (decimal)
- status: String (COMPLETE|FAILED|PENDING)
- timestamp: String (ISO format)
- payment_data: String (JSON)
```

### Database Operations

#### Read

```javascript
function getPitches() {
    const sheet = getSheet(SHEETS.PITCHES);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row (index 0)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        // Process row
    }
}
```

#### Write

```javascript
function createBooking(params) {
    const sheet = getSheet(SHEETS.BOOKINGS);
    sheet.appendRow([
        bookingId,
        params.date,
        params.timeSlot.label,
        // ... other fields
    ]);
}
```

#### Update

```javascript
function updateBookingPaymentStatus(bookingId, status) {
    const sheet = getSheet(SHEETS.BOOKINGS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === bookingId) {
            // i+1 because sheets are 1-indexed
            sheet.getRange(i + 1, 15).setValue(status);
            break;
        }
    }
}
```

---

## API Reference

### Base URL

```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
```

### Endpoints

#### GET /exec?action=getPitches

Get all active pitches.

**Request**:
```
GET /exec?action=getPitches
```

**Response**:
```json
{
    "success": true,
    "pitches": [
        {
            "pitch_id": 1,
            "name": "Professional Turf Pitch",
            "capacity": 22,
            "hourly_rate": 450,
            "description": "Premium natural turf pitch",
            "active_flag": true
        }
    ]
}
```

#### POST /exec?action=checkAvailability

Check if a time slot is available.

**Request**:
```json
{
    "action": "checkAvailability",
    "date": "2025-11-10",
    "timeSlot": 0,
    "duration": 2,
    "pitchId": 1
}
```

**Response**:
```json
{
    "success": true,
    "available": true,
    "message": "The pitch is available for the selected time!"
}
```

#### POST /exec?action=createBooking

Create a new booking.

**Request**:
```json
{
    "action": "createBooking",
    "date": "2025-11-10",
    "timeSlot": {
        "label": "10:00 AM - 11:00 AM",
        "start": "10:00",
        "end": "11:00"
    },
    "duration": 2,
    "pitchId": 1,
    "teamName": "Warriors Cricket Club",
    "playersCount": 11,
    "contactName": "John Smith",
    "contactPhone": "+27821234567",
    "contactEmail": "john@warriors.com",
    "partyType": "match",
    "subtotal": 900,
    "vat": 135,
    "total": 1035,
    "specialRequirements": ""
}
```

**Response**:
```json
{
    "success": true,
    "bookingId": "BK1730678912345123",
    "message": "Booking created successfully"
}
```

#### POST /exec?action=payfast_notify

PayFast IPN notification (called by PayFast).

**Request**: Form data from PayFast
**Response**: Plain text "OK" or "ERROR"

---

## Payment Integration

### PayFast Flow

```
1. Customer submits booking
   ↓
2. Backend creates booking (status: pending)
   ↓
3. Frontend generates PayFast form
   ↓
4. User redirected to PayFast
   ↓
5. User completes payment
   ↓
6. PayFast sends IPN to backend
   ↓
7. Backend updates booking (status: confirmed)
   ↓
8. User redirected to success page
```

### PayFast Form Generation

```javascript
function redirectToPayFast(bookingId, formData) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = PAYFAST_URL;
    
    const params = {
        merchant_id: CONFIG.PAYFAST.MERCHANT_ID,
        merchant_key: CONFIG.PAYFAST.MERCHANT_KEY,
        amount: formData.total.toFixed(2),
        item_name: `Cricket Arena Booking - ${bookingId}`,
        // ... other parameters
    };
    
    // Add hidden fields
    for (let key in params) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
    }
    
    document.body.appendChild(form);
    form.submit();
}
```

### IPN Handling

```javascript
function handlePayFastNotification(e) {
    const params = e.parameter;
    
    // Log transaction
    logTransaction(params);
    
    // Update booking if payment complete
    if (params.payment_status === 'COMPLETE') {
        const bookingId = params.m_payment_id;
        updateBookingPaymentStatus(bookingId, 'paid');
        sendChatNotification('payment_confirmed', {...});
    }
    
    return ContentService.createTextOutput('OK');
}
```

---

## Security

### Frontend Security

1. **Input Validation**:
```javascript
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

2. **XSS Prevention**:
- No `innerHTML` with user data
- Use `textContent` for user input

3. **HTTPS Only**:
- All requests over HTTPS
- Enforced by Google Apps Script

### Backend Security

1. **Authorization**:
```javascript
// Apps Script runs as authorized user
// Permissions checked automatically
```

2. **Input Sanitization**:
```javascript
function sanitizeInput(input) {
    return String(input).trim();
}
```

3. **Rate Limiting** (recommended addition):
```javascript
const requestCache = {};

function checkRateLimit(identifier) {
    // Implement rate limiting logic
}
```

### Payment Security

1. **PayFast Validation**:
- Signature verification (implement if using passphrase)
- IP whitelist (optional)

2. **No Sensitive Data Storage**:
- Credit card info never stored
- Only transaction IDs kept

---

## Performance

### Optimization Strategies

1. **Caching**:
```javascript
// Cache pitches data for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let pitchesCache = null;
let cacheTime = 0;
```

2. **Lazy Loading**:
```javascript
// Load images on scroll
<img loading="lazy" src="image.jpg">
```

3. **Minimize Requests**:
```javascript
// Combine data fetching
async function loadAllData() {
    const [pitches, slots] = await Promise.all([
        loadPitches(),
        loadTimeSlots()
    ]);
}
```

### Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Page Load | < 2s | ~1.5s |
| API Response | < 500ms | ~300ms |
| Payment Redirect | < 1s | ~800ms |

### Google Apps Script Quotas

| Resource | Free Tier Limit |
|----------|----------------|
| URL Fetch calls | 20,000/day |
| Script runtime | 6 min/execution |
| Triggers | 20/script |
| Email sends | 100/day |

---

## Extending the System

### Adding New Features

#### 1. Email Notifications

Add to Code.gs:

```javascript
function sendEmailNotification(type, data) {
    const recipient = data.contactEmail;
    let subject, body;
    
    switch(type) {
        case 'booking_confirmation':
            subject = `Booking Confirmed: ${data.bookingId}`;
            body = `Your booking for ${data.date} is confirmed.`;
            break;
    }
    
    MailApp.sendEmail(recipient, subject, body);
}
```

#### 2. SMS Notifications

Integrate Twilio or similar:

```javascript
function sendSMS(phone, message) {
    const twilioUrl = 'https://api.twilio.com/2010-04-01/Accounts/[SID]/Messages.json';
    
    const payload = {
        To: phone,
        From: '+27XXXXXXXXX',
        Body: message
    };
    
    const options = {
        method: 'post',
        payload: payload,
        headers: {
            'Authorization': 'Basic ' + Utilities.base64Encode('[SID]:[TOKEN]')
        }
    };
    
    UrlFetchApp.fetch(twilioUrl, options);
}
```

#### 3. Admin Dashboard

Create admin.html:

```html
<!-- Simple admin interface -->
<div id="dashboard">
    <h1>Admin Dashboard</h1>
    <div id="todayBookings"></div>
    <div id="revenueChart"></div>
</div>

<script>
async function loadDashboard() {
    const bookings = await fetch(API_URL + '?action=getBookings');
    // Render dashboard
}
</script>
```

#### 4. Booking Reminders

Add to Code.gs:

```javascript
function sendReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const bookings = getBookingsForDate(tomorrowStr);
    
    bookings.forEach(booking => {
        sendEmailNotification('reminder', booking);
    });
}

// Set up daily trigger
function createReminderTrigger() {
    ScriptApp.newTrigger('sendReminders')
        .timeBased()
        .everyDays(1)
        .atHour(10)
        .create();
}
```

### Customization Examples

#### 1. Multi-Arena Support

Add arena_id to database:

```javascript
// In Bookings sheet, add column: arena_id
// In Pitches sheet, add column: arena_id

// Filter pitches by arena
function getPitches(arenaId) {
    // ... filter by arena_id
}
```

#### 2. Dynamic Pricing

Implement time-based pricing:

```javascript
function calculatePrice(timeSlot, baseRate, date) {
    let multiplier = 1;
    
    // Weekend premium
    const day = new Date(date).getDay();
    if (day === 0 || day === 6) {
        multiplier = 1.2;
    }
    
    // Evening premium
    const hour = parseInt(timeSlot.start.split(':')[0]);
    if (hour >= 18) {
        multiplier = 1.3;
    }
    
    return baseRate * multiplier;
}
```

#### 3. Loyalty Program

Track booking history:

```javascript
// Add Customers sheet
// Track: email, total_bookings, total_spent

function applyDiscount(customerEmail, totalAmount) {
    const customer = getCustomer(customerEmail);
    
    if (customer.total_bookings >= 10) {
        return totalAmount * 0.9; // 10% discount
    }
    
    return totalAmount;
}
```

---

## Development Workflow

### Local Development

1. Edit HTML/CSS/JS locally
2. Test with mock data (API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')
3. Use browser DevTools for debugging

### Testing

```javascript
// Add to Code.gs
function testCreateBooking() {
    const result = createBooking({
        // Test data
    });
    Logger.log(result);
}

// Run in Apps Script editor
```

### Deployment

1. **Backend**:
   - Edit in Apps Script editor
   - Save
   - Deploy > Manage deployments > Edit
   - Deploy new version

2. **Frontend**:
   - Update files
   - Upload to hosting
   - Clear CDN cache if applicable

### Version Control

```bash
# Git workflow
git init
git add .
git commit -m "Initial commit"
git branch production
git push origin production
```

---

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Google Apps Script handles CORS automatically
   - Ensure deployment is set to "Anyone"

2. **Quota Exceeded**:
   - Check Apps Script dashboard
   - Implement caching
   - Optimize database queries

3. **Payment Not Updating**:
   - Check IPN URL
   - Verify PayFast IP whitelist
   - Check Apps Script logs

### Debugging

```javascript
// Enable logging
Logger.log('Debug info: ' + JSON.stringify(data));

// View logs: Apps Script editor > Executions
```

---

## API Rate Limits

| Service | Limit | Notes |
|---------|-------|-------|
| Google Apps Script | 20,000 URL fetch/day | Free tier |
| PayFast | No hard limit | Subject to fraud prevention |
| Google Sheets | Read/Write based on quota | Generally sufficient |

---

## Conclusion

This technical documentation covers the core architecture and implementation details. For specific customizations or advanced features, refer to the source code comments and Google Apps Script documentation.

**Version**: 1.0.0
**Last Updated**: November 2025
