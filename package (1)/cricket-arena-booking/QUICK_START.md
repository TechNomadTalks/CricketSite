# Quick Start Guide - Cricket Arena Booking System

Get your booking system live in 30 minutes!

## What You'll Need

- [ ] Google Account
- [ ] PayFast Account (sign up at sandbox.payfast.co.za for testing)
- [ ] Web hosting (GitHub Pages is free and easy)

## 5-Step Setup

### Step 1: Google Sheet (2 minutes)

1. Go to https://sheets.google.com/
2. Click "Blank" to create new sheet
3. Rename it "Cricket Arena Booking Database"
4. Copy the ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[COPY_THIS_PART]/edit
   ```
   Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### Step 2: Backend Setup (10 minutes)

1. Go to https://script.google.com/
2. Click "New project"
3. Rename to "Cricket Arena Booking Backend"
4. Delete default code
5. Open `backend/Code.gs` from this project
6. Copy ALL the code
7. Paste into script editor
8. Update line 14:
   ```javascript
   SPREADSHEET_ID: 'PASTE_YOUR_SHEET_ID_HERE'
   ```
9. Click Save (disk icon or Ctrl+S)
10. At top, select function dropdown → choose `setupDatabase`
11. Click Run (play button)
12. Click "Review permissions" → Choose your account → Allow
13. Wait for "Execution completed"
14. Check your Google Sheet - should now have 5 tabs!
15. Click "Deploy" → "New deployment"
16. Click gear icon → select "Web app"
17. Set:
    - Execute as: **Me**
    - Who has access: **Anyone**
18. Click "Deploy"
19. **COPY THE WEB APP URL** (you'll need this!)
20. Click "Done"

### Step 3: PayFast Setup (5 minutes)

**For Testing (Sandbox Mode)**:
1. Go to https://sandbox.payfast.co.za/
2. Sign up for free test account
3. Login to dashboard
4. Go to Settings → Integration
5. Note these values:
   - Merchant ID: `10000100`
   - Merchant Key: `46f0cd694581a`

**For Production (skip for now)**:
- Sign up at https://www.payfast.co.za/
- Complete verification (1-2 days)
- Use live credentials

### Step 4: Configure Frontend (5 minutes)

1. Open `frontend/config.js` in a text editor
2. Update line 10:
   ```javascript
   API_URL: 'PASTE_YOUR_APPS_SCRIPT_URL_HERE'
   ```
   (The URL you copied in Step 2)
3. Update lines 15-16 (for sandbox testing):
   ```javascript
   MERCHANT_ID: '10000100',
   MERCHANT_KEY: '46f0cd694581a'
   ```
4. Save the file

### Step 5: Deploy Frontend (8 minutes)

**Option A: GitHub Pages** (Recommended)

1. Create GitHub account (github.com)
2. Click "+" → "New repository"
3. Name it "cricket-booking"
4. Check "Public"
5. Click "Create repository"
6. Upload all files from `frontend/` folder
7. Go to Settings → Pages
8. Source: Deploy from a branch
9. Branch: main, folder: / (root)
10. Click Save
11. Wait 2-3 minutes
12. Your site will be at: `https://YOUR_USERNAME.github.io/cricket-booking/`

**Option B: Netlify** (Easiest)

1. Go to https://www.netlify.com/
2. Sign up (free)
3. Drag and drop the `frontend/` folder
4. Done! Site is live instantly
5. Get your URL: `https://RANDOM_NAME.netlify.app/`

### Step 6: Update Return URLs (5 minutes)

1. Open `frontend/config.js` again
2. Update lines 21-23 with your actual website URL:
   ```javascript
   RETURN_URL: 'https://your-actual-url.com/payment-success.html',
   CANCEL_URL: 'https://your-actual-url.com/payment-cancel.html',
   NOTIFY_URL: 'YOUR_APPS_SCRIPT_URL?action=payfast_notify'
   ```
3. Save and re-upload to your hosting
4. Go to PayFast sandbox dashboard
5. Settings → Integration
6. Set Notify URL to: `YOUR_APPS_SCRIPT_URL?action=payfast_notify`
7. Save

## Test Your System

1. **Visit your website**
2. **Scroll to "Book Now" section**
3. **Fill out the form**:
   - Select today's date
   - Choose any time slot
   - Select a pitch
   - Click "Check Availability"
   - Fill in team details (use test data)
   - Review and submit
4. **You'll be redirected to PayFast**
   - In sandbox mode, use test cards
   - Complete payment
5. **Check success**:
   - Should redirect to success page
   - Check your Google Sheet → Bookings tab
   - Should see new booking!
   - Check Transactions tab
   - Should see payment record!

## Common Issues

### "API_URL not configured" warning
**Fix**: You forgot to update `config.js` with your Apps Script URL

### Pitches not loading
**Fix**: 
1. Check you ran `setupDatabase` function
2. Verify Spreadsheet ID is correct in `Code.gs`
3. Make sure deployment access is "Anyone"

### PayFast page doesn't load
**Fix**: 
1. Verify Merchant ID and Key in `config.js`
2. Check SANDBOX is set to `true`

## Next Steps

### Before Going Live

1. **Get PayFast Live Account**
   - Sign up at payfast.co.za
   - Complete verification
   - Get live credentials

2. **Update Credentials**
   - Backend `Code.gs`: Update PayFast credentials
   - Frontend `config.js`: Update credentials
   - Set `SANDBOX: false`

3. **Test with Real Payment**
   - Make small booking (R 50)
   - Complete payment
   - Verify everything works

4. **Launch**
   - Announce to customers
   - Monitor first bookings
   - Be ready to help users

### Optional Enhancements

- **Google Chat Notifications**: Follow docs/CONFIGURATION.md
- **Custom Domain**: Add domain to your hosting
- **Email Notifications**: See docs/TECHNICAL.md
- **Customize Pitches**: Edit Google Sheet → Pitches tab

## URLs to Save

| Item | URL |
|------|-----|
| Your Google Sheet | _________________________ |
| Apps Script Editor | _________________________ |
| Apps Script Web App | _________________________ |
| Your Website | _________________________ |
| PayFast Dashboard | https://sandbox.payfast.co.za/ |

## Need More Help?

- **Complete Guide**: See `docs/DEPLOYMENT.md`
- **Configuration Options**: See `docs/CONFIGURATION.md`
- **User Manual**: See `docs/USER_MANUAL.md`
- **Technical Details**: See `docs/TECHNICAL.md`

## Success Checklist

Your system is working when:
- [ ] Website loads without errors
- [ ] Pitches display (3 default pitches)
- [ ] Can select date and time
- [ ] Availability check works
- [ ] Can fill out booking form
- [ ] PayFast redirect works
- [ ] Payment can be completed
- [ ] Success page shows booking ref
- [ ] Booking appears in Google Sheet
- [ ] Transaction logged in sheet

## You're Done!

Your cricket arena booking system is now live! 

**What You Built**:
- Professional booking website
- Secure payment processing
- Real-time database
- Zero monthly costs

**Total Time**: 30-45 minutes
**Monthly Cost**: R 0 (only transaction fees)

## Go Live Checklist

When ready for real bookings:

1. [ ] Switch PayFast to live mode
2. [ ] Update all credentials
3. [ ] Set SANDBOX to false
4. [ ] Test with real small payment
5. [ ] Add your actual contact info to website
6. [ ] Update operating hours if needed
7. [ ] Customize pitch names/prices if needed
8. [ ] Share website URL with customers
9. [ ] Monitor first few bookings

---

**Congratulations!** Your booking system is ready for business.

For detailed instructions on any step, see the full documentation in the `docs/` folder.

---

Built for South African cricket arenas | November 2025
