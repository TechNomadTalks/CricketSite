# Cricket Arena Booking - Production Implementation Guide

## Current Status

### ✅ Completed
1. **Multi-page website structure** - 6 separate HTML pages created
2. **Video section** on about.html with South African theme
3. **3-step booking form** with client-side validation
4. **Responsive design** with South African colors (Green #1B5E20 and Gold #FFC107)
5. **Backend code prepared** - Supabase schema and edge functions ready

### ⚠️ Pending for Production
1. **Backend deployment** - Requires Supabase credentials
2. **PayFast integration** - Needs merchant credentials
3. **End-to-end testing** - Needs backend to be live

---

## Backend Implementation Steps

### Step 1: Setup Supabase Database

1. **Run the SQL migration**:
   - File: `/workspace/cricket-arena-booking/supabase/schema.sql`
   - Execute in Supabase SQL Editor
   - This creates:
     - `cricket_pitches` table with 3 default pitches
     - `cricket_bookings` table for storing bookings
     - Row Level Security policies for public access

2. **Verify data**:
   ```sql
   SELECT * FROM cricket_pitches;
   -- Should return 3 pitches
   ```

### Step 2: Deploy Edge Functions

Deploy these 3 edge functions to Supabase:

1. **get-pitches**
   - File: `/workspace/cricket-arena-booking/supabase/functions/get-pitches/index.ts`
   - Purpose: Fetches all active cricket pitches
   - Endpoint: `https://[PROJECT_ID].supabase.co/functions/v1/get-pitches`

2. **check-availability**
   - File: `/workspace/cricket-arena-booking/supabase/functions/check-availability/index.ts`
   - Purpose: Checks if a pitch is available for selected date/time
   - Endpoint: `https://[PROJECT_ID].supabase.co/functions/v1/check-availability`
   - Method: POST
   - Body: `{ date, timeSlot, duration, pitchId }`

3. **create-booking**
   - File: `/workspace/cricket-arena-booking/supabase/functions/create-booking/index.ts`
   - Purpose: Creates a new booking record
   - Endpoint: `https://[PROJECT_ID].supabase.co/functions/v1/create-booking`
   - Method: POST
   - Body: Complete booking data

### Step 3: Update Frontend Configuration

Update `/workspace/cricket-arena-booking/frontend/config.js`:

```javascript
const CONFIG = {
    // Replace with your actual Edge Function URLs
    API_URL: 'https://[PROJECT_ID].supabase.co/functions/v1',
    
    PAYFAST: {
        SANDBOX: true, // Set to false for production
        MERCHANT_ID: 'YOUR_MERCHANT_ID',
        MERCHANT_KEY: 'YOUR_MERCHANT_KEY',
        SANDBOX_URL: 'https://sandbox.payfast.co.za/eng/process',
        LIVE_URL: 'https://www.payfast.co.za/eng/process',
        RETURN_URL: window.location.origin + '/payment-success.html',
        CANCEL_URL: window.location.origin + '/payment-cancel.html',
        NOTIFY_URL: 'https://[PROJECT_ID].supabase.co/functions/v1/payfast-webhook'
    },
    
    // ... rest of config
};
```

### Step 4: Update app.js API Calls

Modify the API calls in `app.js`:

**Load Pitches**:
```javascript
async function loadPitches() {
    try {
        showLoading();
        
        const response = await fetch(`${CONFIG.API_URL}/get-pitches`);
        const data = await response.json();
        
        if (data.success) {
            pitchesData = data.pitches;
            renderPitches();
            populatePitchSelect();
        } else {
            throw new Error(data.message);
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading pitches:', error);
        showToast('Error loading pitches', 'error');
        hideLoading();
    }
}
```

**Check Availability**:
```javascript
async function checkAvailability() {
    const date = document.getElementById('bookingDate').value;
    const timeSlotIndex = document.getElementById('timeSlot').value;
    const duration = document.getElementById('duration').value;
    const pitchId = document.getElementById('pitchSelect').value;
    
    if (!date || !timeSlotIndex || !pitchId) {
        showToast('Please select date, time slot, and pitch first.', 'warning');
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch(`${CONFIG.API_URL}/check-availability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date,
                timeSlot: CONFIG.TIME_SLOTS[timeSlotIndex].label,
                duration: parseInt(duration),
                pitchId: parseInt(pitchId)
            })
        });
        
        const data = await response.json();
        hideLoading();
        
        if (data.success) {
            showAvailabilityStatus(data.available, data.message);
        } else {
            showAvailabilityStatus(false, data.message);
        }
    } catch (error) {
        console.error('Availability check error:', error);
        hideLoading();
        showToast('Error checking availability', 'error');
    }
}
```

**Create Booking**:
```javascript
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateStep(3)) {
        return;
    }
    
    try {
        showLoading();
        
        const formData = {
            date: document.getElementById('bookingDate').value,
            timeSlot: CONFIG.TIME_SLOTS[document.getElementById('timeSlot').value],
            duration: parseInt(document.getElementById('duration').value),
            pitchId: parseInt(document.getElementById('pitchSelect').value),
            teamName: document.getElementById('teamName').value,
            playersCount: parseInt(document.getElementById('playersCount').value),
            contactName: document.getElementById('contactName').value,
            contactPhone: document.getElementById('contactPhone').value,
            contactEmail: document.getElementById('contactEmail').value,
            partyType: document.getElementById('partyType').value,
            specialRequirements: document.getElementById('specialRequirements').value,
            subtotal: bookingData.subtotal,
            vat: bookingData.vat,
            total: bookingData.total
        };
        
        const response = await fetch(`${CONFIG.API_URL}/create-booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        hideLoading();
        
        if (data.success) {
            // Redirect to PayFast
            redirectToPayFast(data.bookingId, formData);
        } else {
            showToast(data.message || 'Error creating booking', 'error');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        hideLoading();
        showToast('Error submitting booking', 'error');
    }
}
```

---

## Booking Form Functionality Testing Checklist

### Manual Test Script

**Test URL**: https://4p3u8bu8vls4.space.minimax.io/booking.html

#### Test 1: Page Load
- [ ] Page loads without errors
- [ ] All 3 progress steps are visible
- [ ] Step 1 is marked as active
- [ ] Form fields are visible in Step 1

#### Test 2: Step 1 - Date & Time Selection
- [ ] Date picker allows future dates only
- [ ] Time slot dropdown shows 16 options (6 AM - 10 PM)
- [ ] Duration dropdown shows 1-6 hours
- [ ] Pitch dropdown shows 3 pitches (currently mock data)
- [ ] "Check Availability" button is present
- [ ] Click "Next" without filling fields → Shows validation error
- [ ] Fill all fields → Click "Next" → Advances to Step 2

#### Test 3: Step 2 - Team Details
- [ ] All input fields are visible
- [ ] "Back" button returns to Step 1
- [ ] Click "Next" without filling → Shows validation error
- [ ] Enter invalid email → Shows validation error
- [ ] Enter phone < 10 digits → Shows validation error
- [ ] Fill all fields correctly → Click "Next" → Advances to Step 3

#### Test 4: Step 3 - Review & Payment
- [ ] Booking summary displays all entered information:
  - Date (formatted)
  - Time slot
  - Duration
  - Pitch name
  - Team name
  - Number of players
  - Contact info (name, phone, email)
- [ ] Price calculation shows:
  - Subtotal = (hourly rate × duration)
  - VAT = (subtotal × 0.15)
  - Total = (subtotal + VAT)
- [ ] "Back" button returns to Step 2
- [ ] "Proceed to Payment" button is visible

#### Test 5: Price Calculation Verification

**Example 1**: Astro Turf Pitch, 2 hours
- Hourly rate: R 350
- Duration: 2 hours
- Expected subtotal: R 700.00
- Expected VAT (15%): R 105.00
- Expected total: R 805.00

**Example 2**: Professional Turf Pitch, 3 hours
- Hourly rate: R 450
- Duration: 3 hours
- Expected subtotal: R 1,350.00
- Expected VAT (15%): R 202.50
- Expected total: R 1,552.50

#### Test 6: Navigation Flow
- [ ] Progress indicator updates as you move through steps
- [ ] Can navigate back through steps
- [ ] Data persists when going back/forward
- [ ] Cannot skip steps

#### Test 7: Responsive Design
- [ ] Resize browser to mobile width (< 768px)
- [ ] Form is still usable and readable
- [ ] Buttons are accessible
- [ ] All fields are visible

#### Test 8: Error Handling
- [ ] Invalid date shows error
- [ ] Missing required fields show validation messages
- [ ] Error messages are clear and helpful

---

## Current Implementation Status

### What Works NOW (Mock Mode)
✅ All 3 steps of booking form
✅ Client-side validation
✅ Price calculation
✅ Form data persistence across steps
✅ Responsive design
✅ Progress indicator
✅ Mock pitch data displays correctly

### What Needs Backend (Production Mode)
❌ Load real pitches from database
❌ Check actual availability against bookings
❌ Save bookings to database
❌ PayFast payment processing
❌ Email confirmations
❌ Booking management

---

## Quick Test Commands

Test if pages are accessible:
```bash
curl -I https://4p3u8bu8vls4.space.minimax.io/index.html
curl -I https://4p3u8bu8vls4.space.minimax.io/facilities.html
curl -I https://4p3u8bu8vls4.space.minimax.io/booking.html
curl -I https://4p3u8bu8vls4.space.minimax.io/about.html
```

Check if JavaScript is loaded:
```bash
curl -s https://4p3u8bu8vls4.space.minimax.io/app.js | grep -c "function nextStep"
curl -s https://4p3u8bu8vls4.space.minimax.io/app.js | grep -c "function checkAvailability"
```

---

## Files Ready for Deployment

### Database Schema
`/workspace/cricket-arena-booking/supabase/schema.sql`

### Edge Functions
- `/workspace/cricket-arena-booking/supabase/functions/get-pitches/index.ts`
- `/workspace/cricket-arena-booking/supabase/functions/check-availability/index.ts`
- `/workspace/cricket-arena-booking/supabase/functions/create-booking/index.ts`

### Frontend (Already Deployed)
All files in `/workspace/cricket-arena-booking/frontend/` are deployed to:
https://4p3u8bu8vls4.space.minimax.io

---

## Next Steps for Production

1. **Get Supabase Access**:
   - Deploy database schema
   - Deploy edge functions
   - Get edge function URLs

2. **Update Configuration**:
   - Update `config.js` with real API URLs
   - Configure PayFast credentials

3. **Redeploy Frontend**:
   - Deploy updated config.js

4. **End-to-End Testing**:
   - Test complete booking flow
   - Verify database entries
   - Test payment integration

5. **Go Live**:
   - Switch PayFast to live mode
   - Update DNS/domain if needed
   - Monitor bookings

---

## Support Documentation

### Troubleshooting

**Issue**: "Loading pitches..." never completes
**Solution**: Check browser console for API errors. Verify edge function URLs in config.js

**Issue**: "Check Availability" doesn't respond
**Solution**: Verify check-availability edge function is deployed and URL is correct

**Issue**: Form validation not working
**Solution**: Ensure app.js is loaded. Check browser console for JavaScript errors

**Issue**: Price calculation shows R 0.00
**Solution**: Ensure pitch is selected and has valid hourly_rate

### Browser Console Testing

Open browser console (F12) and test functions:
```javascript
// Test pitch loading
loadPitches();

// Test price calculation
calculatePrice();

// Test form validation
validateStep(1);
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-04
**Status**: Ready for Backend Deployment
