# Deployment Guide - Cricket Arena Booking System

This comprehensive guide walks you through deploying the Cricket Arena Booking System from start to finish.

## Prerequisites

Before you begin, ensure you have:
- [ ] Google Account
- [ ] PayFast Merchant Account (or test in sandbox mode)
- [ ] Web hosting service (GitHub Pages, Netlify, Vercel, or any static host)
- [ ] Basic understanding of Google Apps Script (helpful but not required)

## Deployment Timeline

**Estimated Time**: 30-45 minutes for complete setup

---

## Part 1: Google Sheets Database Setup (5 minutes)

### Step 1: Create Google Sheet

1. Go to https://sheets.google.com/
2. Click "Blank" to create a new spreadsheet
3. Rename it to "Cricket Arena Booking Database"
4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
   Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### Step 2: Note Your Spreadsheet ID

Save this ID - you'll need it in the next steps.

**DO NOT create sheets manually** - the backend will auto-create all required sheets on first run.

---

## Part 2: Google Apps Script Backend (15 minutes)

### Step 1: Create New Apps Script Project

1. Go to https://script.google.com/
2. Click "New project"
3. Rename the project to "Cricket Arena Booking Backend"

### Step 2: Add Backend Code

1. Delete the default code in the editor
2. Copy the entire contents of `backend/Code.gs`
3. Paste into the script editor

### Step 3: Configure Backend

Update the CONFIG object at the top of the file:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE', // From Part 1
  PAYFAST: {
    MERCHANT_ID: 'YOUR_MERCHANT_ID',     // From PayFast dashboard
    MERCHANT_KEY: 'YOUR_MERCHANT_KEY',   // From PayFast dashboard
    PASSPHRASE: 'YOUR_PASSPHRASE'        // Optional but recommended
  },
  GOOGLE_CHAT_WEBHOOK: 'YOUR_GOOGLE_CHAT_WEBHOOK_URL', // Optional
  VAT_RATE: 0.15,
  TIMEZONE: 'Africa/Johannesburg'
};
```

**For Testing**: You can use placeholder values for PayFast initially:
```javascript
PAYFAST: {
  MERCHANT_ID: '10000100',
  MERCHANT_KEY: '46f0cd694581a',
  PASSPHRASE: ''
}
```

### Step 4: Run Setup Function

1. In the script editor, select the function `setupDatabase` from the dropdown
2. Click "Run" (play button)
3. **First time**: You'll be asked to authorize the script
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" > "Go to Cricket Arena Booking Backend (unsafe)"
   - Click "Allow"
4. Wait for execution to complete
5. Check your Google Sheet - it should now have 5 tabs:
   - Bookings
   - Pitches
   - TimeSlots
   - Settings
   - Transactions

### Step 5: Deploy as Web App

1. Click "Deploy" > "New deployment"
2. Click the gear icon and select "Web app"
3. Configure deployment:
   - **Description**: "Cricket Arena Booking API v1"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click "Deploy"
5. **IMPORTANT**: Copy the Web App URL - you'll need this for frontend config
   ```
   Example: https://script.google.com/macros/s/AKfycbx.../exec
   ```
6. Click "Done"

### Step 6: Test Backend

1. Open the Web App URL in a browser
2. Add `?action=getPitches` to the end
   ```
   https://script.google.com/macros/s/AKfycbx.../exec?action=getPitches
   ```
3. You should see JSON response with pitches data
4. If you see an error, check:
   - Spreadsheet ID is correct
   - You ran `setupDatabase` function
   - Permissions were granted

---

## Part 3: PayFast Configuration (10 minutes)

### Option A: Sandbox Mode (Testing)

1. Go to https://sandbox.payfast.co.za/
2. Sign up for a sandbox account
3. Login to sandbox dashboard
4. Go to Settings > Integration
5. Copy your sandbox credentials:
   - Merchant ID: `10000100`
   - Merchant Key: `46f0cd694581a`
   - Passphrase: Leave blank or create one

### Option B: Live Mode (Production)

1. Go to https://www.payfast.co.za/
2. Sign up for a merchant account
3. Complete verification process (may take 1-2 days)
4. Login to PayFast dashboard
5. Go to Settings > Integration
6. Copy your live credentials:
   - Merchant ID
   - Merchant Key
   - Passphrase (create if you haven't)

### Configure IPN (Instant Payment Notification)

1. In PayFast dashboard, go to Settings > Integration
2. Set the Notify URL to:
   ```
   https://script.google.com/macros/s/[YOUR_SCRIPT_ID]/exec?action=payfast_notify
   ```
3. Save settings

---

## Part 4: Google Chat Integration (Optional, 5 minutes)

### Create Chat Webhook

1. Open Google Chat (https://chat.google.com/)
2. Create a new space or use existing space
3. Click space name > "Apps & integrations"
4. Click "Add webhooks"
5. Name it "Cricket Arena Bookings"
6. Copy the webhook URL
7. Paste it in backend CONFIG and frontend config.js

**Skip this step** if you don't want chat notifications.

---

## Part 5: Frontend Deployment (10 minutes)

### Step 1: Configure Frontend

Edit `frontend/config.js`:

```javascript
const CONFIG = {
    // Replace with your Google Apps Script URL from Part 2
    API_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
    
    PAYFAST: {
        // Set to false for production
        SANDBOX: true,
        
        // Your PayFast credentials from Part 3
        MERCHANT_ID: '10000100',
        MERCHANT_KEY: '46f0cd694581a',
        
        // These will be updated after you deploy frontend
        RETURN_URL: 'https://yourdomain.com/payment-success.html',
        CANCEL_URL: 'https://yourdomain.com/payment-cancel.html',
        NOTIFY_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL?action=payfast_notify'
    },
    
    // Optional: Google Chat webhook
    GOOGLE_CHAT_WEBHOOK: 'YOUR_WEBHOOK_URL'
};
```

### Step 2: Choose Hosting Service

**Option A: GitHub Pages (Recommended)**

1. Create a GitHub account if you don't have one
2. Create a new repository named "cricket-arena-booking"
3. Upload all files from `frontend/` folder
4. Go to Settings > Pages
5. Select branch: main, folder: / (root)
6. Click Save
7. Your site will be at: `https://username.github.io/cricket-arena-booking/`

**Option B: Netlify**

1. Sign up at https://www.netlify.com/
2. Drag and drop the `frontend/` folder
3. Site will be deployed instantly
4. Get your site URL: `https://your-site-name.netlify.app/`

**Option C: Vercel**

1. Sign up at https://vercel.com/
2. Click "New Project"
3. Import the `frontend/` folder
4. Deploy
5. Get your site URL: `https://your-site-name.vercel.app/`

### Step 3: Update Return URLs

After deploying frontend:

1. Note your website URL
2. Update `config.js` with correct URLs:
   ```javascript
   RETURN_URL: 'https://your-actual-domain.com/payment-success.html',
   CANCEL_URL: 'https://your-actual-domain.com/payment-cancel.html',
   ```
3. Re-upload the updated `config.js` to your hosting

### Step 4: Update PayFast URLs

1. Login to PayFast dashboard
2. Go to Settings > Integration
3. Update:
   - Return URL: Your payment-success.html URL
   - Cancel URL: Your payment-cancel.html URL
4. Save changes

---

## Part 6: Testing (5 minutes)

### Test Checklist

1. [ ] **Visit your website** - Does it load properly?
2. [ ] **Check pitches display** - Are pitches loading from Google Sheets?
3. [ ] **Select date and time** - Do date pickers work?
4. [ ] **Check availability** - Does the availability check work?
5. [ ] **Fill booking form** - Does form validation work?
6. [ ] **Review step** - Does the summary show correct data?
7. [ ] **Submit booking** - Does it create entry in Google Sheets?
8. [ ] **Test payment** - Does PayFast redirect work?
9. [ ] **Check notifications** - Did you receive Google Chat notification?
10. [ ] **Verify transaction** - Is payment logged in Transactions sheet?

### Common Issues

**Issue**: "API_URL not configured" warning
- **Solution**: Update `config.js` with your Google Apps Script URL

**Issue**: Pitches not loading
- **Solution**: Check backend deployment, verify Spreadsheet ID

**Issue**: PayFast redirect not working
- **Solution**: Verify PayFast credentials, check return URLs

**Issue**: Payment not updating booking
- **Solution**: Check IPN URL in PayFast settings, verify backend logs

---

## Part 7: Going Live

### Pre-Launch Checklist

1. [ ] Switch PayFast from sandbox to live mode
2. [ ] Update PayFast credentials in both frontend and backend
3. [ ] Set `PAYFAST.SANDBOX` to `false` in config.js
4. [ ] Test complete booking flow with small amount
5. [ ] Verify email notifications work
6. [ ] Check mobile responsiveness
7. [ ] Test on multiple browsers
8. [ ] Update contact information in HTML
9. [ ] Configure custom domain (optional)
10. [ ] Set up Google Analytics (optional)

### Launch Day

1. Deploy final frontend version
2. Announce on social media
3. Monitor Google Sheets for bookings
4. Monitor PayFast dashboard for payments
5. Respond to customer inquiries promptly

---

## Maintenance

### Daily Tasks
- Check Google Sheets for new bookings
- Verify payment status matches bookings
- Respond to customer emails

### Weekly Tasks
- Review Google Apps Script quota usage
- Check PayFast transaction reports
- Backup Google Sheets data

### Monthly Tasks
- Reconcile payments with bookings
- Review and update pricing if needed
- Check for any errors in script logs

---

## Support Resources

- **Google Apps Script Docs**: https://developers.google.com/apps-script
- **PayFast Docs**: https://developers.payfast.co.za/
- **Bootstrap Docs**: https://getbootstrap.com/docs/5.3/

---

## Rollback Procedure

If something goes wrong:

1. **Frontend Issues**:
   - Revert to previous version on hosting
   - Check browser console for errors

2. **Backend Issues**:
   - Go to Apps Script > Deploy > Manage deployments
   - Click "Archive" on current deployment
   - Restore previous version

3. **Database Issues**:
   - Google Sheets has version history
   - File > Version history > See version history
   - Restore previous version if needed

---

## Next Steps

After successful deployment:
1. Read `USER_MANUAL.md` to understand booking management
2. Review `TECHNICAL.md` for customization options
3. Set up regular backups of Google Sheets
4. Consider adding features like booking reminders

---

Congratulations! Your Cricket Arena Booking System is now live.
