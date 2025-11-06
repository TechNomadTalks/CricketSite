# Configuration Guide - Cricket Arena Booking System

This guide covers all configuration options for customizing your cricket arena booking system.

## Configuration Files

### 1. Frontend Configuration (`frontend/config.js`)

This file contains all client-side settings.

```javascript
const CONFIG = {
    // Google Apps Script Web App URL
    API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
    
    // PayFast Configuration
    PAYFAST: {
        SANDBOX: true,                    // true for testing, false for production
        MERCHANT_ID: 'YOUR_MERCHANT_ID',
        MERCHANT_KEY: 'YOUR_MERCHANT_KEY',
        SANDBOX_URL: 'https://sandbox.payfast.co.za/eng/process',
        LIVE_URL: 'https://www.payfast.co.za/eng/process',
        RETURN_URL: window.location.origin + '/payment-success.html',
        CANCEL_URL: window.location.origin + '/payment-cancel.html',
        NOTIFY_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE?action=payfast_notify'
    },
    
    // Arena Settings
    ARENA: {
        NAME: 'Cricket Arena South Africa',
        VAT_RATE: 0.15,                   // 15% VAT
        BOOKING_WINDOW_DAYS: 60,          // How far in advance users can book
        MIN_BOOKING_HOURS: 1,
        MAX_BOOKING_HOURS: 8
    },
    
    // Google Chat Webhook (optional)
    GOOGLE_CHAT_WEBHOOK: 'YOUR_GOOGLE_CHAT_WEBHOOK_URL',
    
    // Time Slots Configuration
    TIME_SLOTS: [
        { label: '06:00 AM - 07:00 AM', start: '06:00', end: '07:00' },
        // ... add more slots
    ]
};
```

### 2. Backend Configuration (`backend/Code.gs`)

This file contains server-side settings.

```javascript
const CONFIG = {
    // Your Google Sheet ID
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
    
    // PayFast Configuration
    PAYFAST: {
        MERCHANT_ID: 'YOUR_MERCHANT_ID',
        MERCHANT_KEY: 'YOUR_MERCHANT_KEY',
        PASSPHRASE: 'YOUR_PASSPHRASE'     // Optional but recommended
    },
    
    // Google Chat Webhook (optional)
    GOOGLE_CHAT_WEBHOOK: 'YOUR_GOOGLE_CHAT_WEBHOOK_URL',
    
    // Business Settings
    VAT_RATE: 0.15,
    TIMEZONE: 'Africa/Johannesburg'
};
```

---

## Detailed Configuration Options

### API URL Configuration

**What it is**: The URL of your deployed Google Apps Script web app.

**How to get it**:
1. Deploy your Apps Script as web app
2. Copy the URL provided
3. Paste into `config.js`

**Example**:
```javascript
API_URL: 'https://script.google.com/macros/s/AKfycbxE.../exec'
```

---

### PayFast Configuration

#### Sandbox Mode (Testing)

Use these settings while testing:

```javascript
PAYFAST: {
    SANDBOX: true,
    MERCHANT_ID: '10000100',
    MERCHANT_KEY: '46f0cd694581a',
    // ... other settings
}
```

#### Live Mode (Production)

Switch to live mode when ready:

```javascript
PAYFAST: {
    SANDBOX: false,
    MERCHANT_ID: 'your_actual_merchant_id',
    MERCHANT_KEY: 'your_actual_merchant_key',
    // ... other settings
}
```

#### PayFast URLs

**Return URL**: Where users go after successful payment
```javascript
RETURN_URL: 'https://yourdomain.com/payment-success.html'
```

**Cancel URL**: Where users go if they cancel payment
```javascript
CANCEL_URL: 'https://yourdomain.com/payment-cancel.html'
```

**Notify URL**: Where PayFast sends payment notifications
```javascript
NOTIFY_URL: 'https://script.google.com/macros/s/[ID]/exec?action=payfast_notify'
```

**IMPORTANT**: Update these URLs in both:
1. Frontend `config.js`
2. PayFast merchant dashboard

---

### Arena Settings

#### Business Name
```javascript
ARENA: {
    NAME: 'Cricket Arena South Africa'
}
```
This appears in booking confirmations and notifications.

#### VAT Rate
```javascript
VAT_RATE: 0.15  // 15%
```
Adjust based on your local tax rate.

#### Booking Window
```javascript
BOOKING_WINDOW_DAYS: 60  // Users can book up to 60 days ahead
```

**Recommendations**:
- 30 days: For smaller venues
- 60 days: Standard (recommended)
- 90 days: For popular venues

#### Booking Duration Limits
```javascript
MIN_BOOKING_HOURS: 1,
MAX_BOOKING_HOURS: 8
```

Adjust based on your operational hours and booking policies.

---

### Time Slots Configuration

Define available booking time slots:

```javascript
TIME_SLOTS: [
    { label: '06:00 AM - 07:00 AM', start: '06:00', end: '07:00' },
    { label: '07:00 AM - 08:00 AM', start: '07:00', end: '08:00' },
    // ... add more
]
```

**Tips**:
- Match your operational hours
- Consider peak vs off-peak pricing
- Allow buffer time between bookings if needed

---

### Google Chat Integration

#### Setup Webhook

1. Create Google Chat space
2. Add webhook
3. Copy webhook URL
4. Add to config:

```javascript
GOOGLE_CHAT_WEBHOOK: 'https://chat.googleapis.com/v1/spaces/...'
```

#### Customize Notifications

Edit `sendChatNotification()` function in `Code.gs`:

```javascript
case 'new_booking':
    message = `*New Booking*\n` +
              `ID: ${data.bookingId}\n` +
              `Team: ${data.teamName}\n` +
              `Custom field: ${data.customField}`;
    break;
```

---

### Database Configuration

#### Spreadsheet ID

Get it from your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_ID]/edit
```

Update in `Code.gs`:
```javascript
SPREADSHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
```

#### Sheet Names

Default sheet names (you can change these):
```javascript
const SHEETS = {
    BOOKINGS: 'Bookings',
    PITCHES: 'Pitches',
    TIME_SLOTS: 'TimeSlots',
    SETTINGS: 'Settings',
    TRANSACTIONS: 'Transactions'
};
```

**Note**: If you change sheet names, update the `SHEETS` object accordingly.

---

## Customizing Pitches

### Adding Pitches

Edit your Google Sheet's "Pitches" tab:

| pitch_id | name | capacity | hourly_rate | description | active_flag |
|----------|------|----------|-------------|-------------|-------------|
| 1 | Professional Turf | 22 | 450 | Premium pitch | TRUE |
| 2 | Astro Turf | 22 | 350 | All-weather | TRUE |
| 3 | Training Nets | 12 | 200 | Practice nets | TRUE |

**Fields**:
- `pitch_id`: Unique identifier (integer)
- `name`: Display name
- `capacity`: Maximum players
- `hourly_rate`: Price per hour (ZAR)
- `description`: Brief description
- `active_flag`: TRUE to show, FALSE to hide

### Pricing Strategy

**Flat Rate**:
```
All time slots same price
hourly_rate: 350
```

**Peak vs Off-Peak** (requires customization):
```javascript
// In Code.gs, modify createBooking() function
function calculatePrice(timeSlot, baseRate) {
    const hour = parseInt(timeSlot.split(':')[0]);
    if (hour >= 18) {
        return baseRate * 1.2; // 20% premium for evening
    }
    return baseRate;
}
```

---

## Visual Customization

### Colors

Main colors are defined in `styles.css`:

```css
:root {
    --primary-green: #1B5E20;   /* South African green */
    --primary-gold: #FFC107;     /* South African gold */
    --accent-red: #E74C3C;
    --accent-blue: #2196F3;
}
```

**To change theme**:
1. Update color variables
2. Keep good contrast ratios for accessibility

### Fonts

Current fonts in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```

**To change fonts**:
1. Browse Google Fonts
2. Update the link
3. Update CSS font-family references

### Layout

Modify sections in `index.html`:
- Hero section: Lines 40-85
- Facilities: Lines 88-115
- Pricing: Lines 118-165
- Booking form: Lines 168-350
- Contact: Lines 353-390

---

## Email Notifications (Optional)

Currently, the system sends Google Chat notifications. To add email:

### Add to Code.gs

```javascript
function sendEmailNotification(type, data) {
    const recipientEmail = 'bookings@cricketarena.co.za';
    let subject = '';
    let body = '';
    
    switch(type) {
        case 'new_booking':
            subject = `New Booking: ${data.bookingId}`;
            body = `
                New booking received:
                
                Booking ID: ${data.bookingId}
                Team: ${data.teamName}
                Date: ${data.date}
                Time: ${data.timeSlot}
                Total: R ${data.total.toFixed(2)}
            `;
            break;
    }
    
    MailApp.sendEmail(recipientEmail, subject, body);
}
```

### Call in createBooking()

```javascript
// After creating booking
sendEmailNotification('new_booking', {...});
```

---

## Performance Optimization

### Caching

Add caching to reduce API calls:

```javascript
// In app.js
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let pitchesCache = null;
let pitchesCacheTime = 0;

async function loadPitches() {
    const now = Date.now();
    if (pitchesCache && (now - pitchesCacheTime < CACHE_DURATION)) {
        renderPitches();
        return;
    }
    
    // Fetch from API
    // ...
}
```

### Minimize Requests

Combine API calls where possible:

```javascript
// Bad: Multiple calls
await checkAvailability();
await getPitches();
await getTimeSlots();

// Good: Single call with multiple data
const data = await fetch(API_URL + '?action=getAllData');
```

---

## Security Enhancements

### Input Validation

Add to `Code.gs`:

```javascript
function validateBookingData(data) {
    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
        throw new Error('Invalid email address');
    }
    
    // Validate phone
    if (!/^[\d\s\+\-\(\)]{10,}$/.test(data.contactPhone)) {
        throw new Error('Invalid phone number');
    }
    
    // Validate date is in future
    const bookingDate = new Date(data.date);
    if (bookingDate < new Date()) {
        throw new Error('Cannot book in the past');
    }
    
    return true;
}
```

### Rate Limiting

Prevent abuse with rate limiting:

```javascript
const rateLimitCache = {};

function checkRateLimit(identifier) {
    const now = Date.now();
    const limit = 10; // 10 requests
    const window = 60000; // per minute
    
    if (!rateLimitCache[identifier]) {
        rateLimitCache[identifier] = [];
    }
    
    // Remove old entries
    rateLimitCache[identifier] = rateLimitCache[identifier]
        .filter(time => now - time < window);
    
    if (rateLimitCache[identifier].length >= limit) {
        throw new Error('Rate limit exceeded');
    }
    
    rateLimitCache[identifier].push(now);
    return true;
}
```

---

## Backup Configuration

### Automated Backups

Create a backup trigger in Apps Script:

```javascript
function createBackup() {
    const ss = getSpreadsheet();
    const backupName = `Backup_${new Date().toISOString().split('T')[0]}`;
    const backup = ss.copy(backupName);
    
    Logger.log('Backup created: ' + backup.getId());
}

// Set up trigger: Edit > Current project's triggers
// Add trigger: createBackup, Time-driven, Day timer, 2am-3am
```

---

## Troubleshooting Configuration

### Config Not Loading

**Symptom**: Website shows "API_URL not configured"
**Solution**: Check `config.js` is uploaded and API_URL is set

### PayFast Not Redirecting

**Symptom**: Payment page doesn't load
**Solution**: 
1. Verify PayFast credentials
2. Check SANDBOX mode matches PayFast URL
3. Ensure return URLs are correct

### Google Sheets Not Updating

**Symptom**: Bookings not appearing in sheet
**Solution**:
1. Check SPREADSHEET_ID in Code.gs
2. Verify Apps Script has permission to access sheet
3. Check Apps Script execution logs

---

## Configuration Checklist

Before going live:

- [ ] API_URL set in config.js
- [ ] PayFast credentials updated (both frontend and backend)
- [ ] SANDBOX mode set to false
- [ ] Return URLs updated to production domain
- [ ] Spreadsheet ID correct in Code.gs
- [ ] Google Chat webhook configured (if using)
- [ ] VAT rate correct for your region
- [ ] Time slots match operational hours
- [ ] Pitches data populated in Google Sheet
- [ ] Payment flow tested end-to-end
- [ ] Email notifications configured (if using)

---

## Support

If you encounter configuration issues:
1. Check Apps Script execution logs
2. Verify all URLs are correct
3. Test in sandbox mode first
4. Review PayFast transaction history

---

Your configuration is complete when all features work as expected in sandbox mode before switching to production.
