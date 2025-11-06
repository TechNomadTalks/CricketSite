# Google APIs Required for Full Backend Functionality

## ✅ UPDATES COMPLETED

### 1. **JavaScript Errors Fixed** ✅
- Fixed `Cannot set properties of null` errors
- Added null checks before DOM manipulation
- Functions now check if elements exist before trying to modify them
- Website loads without errors on all pages

### 2. **Chatbot Added** ✅
- Floating chatbot button on bottom-right corner
- **7 Quick-Access Topics:**
  1. 🕐 Operating Hours (24/7)
  2. 📍 Location & Directions
  3. 🏏 Facilities & Pitches
  4. 💰 Pricing & Payment
  5. 📅 How to Book
  6. 👥 Capacity & Group Sizes
  7. ⚙️ Equipment & Amenities
- Interactive Q&A with smart responses
- South African green/gold theme
- Mobile responsive

### 3. **Configuration Updated** ✅
- Email: **imraan@coas.co.za**
- Address: **13 Fairview Terrace, Port Shepstone, 4240**
- Capacity: **30 players per pitch**
- Operating Hours: **24/7**

### 4. **Website Redeployed** ✅
**New URL:** https://ty8d9xe062ej.space.minimax.io

---

## 🔧 GOOGLE APIs NEEDED (For Production Backend)

To make the booking system **fully functional** with real database and payment processing, you'll need these Google services:

### **1. Google Sheets API** (Free)
**Purpose:** Database for storing bookings, pitches, and settings

**What it enables:**
- Store all cricket pitch bookings
- Track availability in real-time
- Manage pitch information
- Store transaction history

**Setup:**
1. Create a Google Sheet
2. Enable Google Sheets API in Google Cloud Console
3. Create service account credentials
4. Share the sheet with the service account email

**Cost:** FREE (within free tier limits)

---

### **2. Google Apps Script** (Free)
**Purpose:** Backend API server (already coded and ready)

**What it enables:**
- RESTful API endpoints
- Business logic for booking validation
- Real-time availability checking
- Double-booking prevention
- Price calculations
- Data validation

**File Ready:** `/workspace/cricket-arena-booking/backend/Code.gs`

**Setup:**
1. Open Google Apps Script (script.google.com)
2. Create new project
3. Copy code from `Code.gs`
4. Deploy as Web App
5. Copy deployment URL to `config.js`

**Cost:** FREE

---

### **3. Gmail API** (Free)
**Purpose:** Send booking confirmations and notifications

**What it enables:**
- Automated booking confirmation emails
- Reminder emails before bookings
- Cancellation notifications
- Receipt generation
- Customer communication

**Setup:**
1. Enable Gmail API in Google Cloud Console
2. Add to Apps Script project
3. Authorize email sending

**Cost:** FREE (within daily limits: 100-1,500 emails/day depending on account)

---

### **4. Google Calendar API** (Optional - Free)
**Purpose:** Sync bookings to calendar

**What it enables:**
- Automatic calendar events for each booking
- Visual availability calendar
- Team members can see upcoming bookings
- Integration with Google Calendar

**Setup:**
1. Enable Calendar API in Google Cloud Console
2. Add to Apps Script project
3. Create dedicated cricket arena calendar

**Cost:** FREE

---

### **5. Google Chat API / Hangouts API** (Free)
**Purpose:** Send booking notifications to Google Chat/Hangouts

**What it enables:**
- Real-time booking notifications in Google Chat
- Team alerts for new bookings
- Cancellation notifications
- Payment confirmations

**Setup:**
1. Create Google Chat webhook URL
2. Add webhook URL to `config.js` (already configured)
3. Apps Script sends messages to Chat

**Cost:** FREE

---

### **6. Google Maps JavaScript API** (Optional - Paid)
**Purpose:** Display interactive map on contact page

**What it enables:**
- Interactive map showing arena location
- Directions to the venue
- Street view
- Nearby landmarks

**Setup:**
1. Enable Maps JavaScript API in Google Cloud Console
2. Get API key
3. Add to contact.html map section

**Cost:**
- $0-$200/month = FREE
- $200+ usage charged at $7 per 1,000 requests
- **Typical usage for your site:** $0-5/month (very low traffic)

---

## 📊 COST SUMMARY

| Google Service | Monthly Cost | Usage Limit |
|----------------|--------------|-------------|
| **Google Sheets API** | **FREE** | 500 requests/100 seconds |
| **Google Apps Script** | **FREE** | 20,000 URL fetches/day |
| **Gmail API** | **FREE** | 100-1,500 emails/day |
| **Google Calendar API** | **FREE** | 1,000,000 requests/day |
| **Google Chat API** | **FREE** | Unlimited messages |
| **Google Maps API** | **$0-5/month** | First $200 free |

### **Total Estimated Monthly Cost: R 0 - R 100**
(Depending on Maps API usage. Everything else is FREE!)

---

## 🚀 DEPLOYMENT STEPS (30 Minutes)

### **Step 1: Google Cloud Console Setup (10 min)**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Cricket Arena Booking"
3. Enable these APIs:
   - Google Sheets API ✓
   - Gmail API ✓
   - Google Calendar API ✓ (optional)
   - Google Maps JavaScript API ✓ (optional)

4. Create Service Account:
   - Go to IAM & Admin → Service Accounts
   - Create service account
   - Download JSON key file
   - Save securely

### **Step 2: Google Sheet Setup (5 min)**

1. Create new Google Sheet
2. Rename to "Cricket Arena Database"
3. Share with service account email (from JSON key)
4. Copy sheet ID from URL: `https://docs.google.com/spreadsheets/d/[THIS-IS-THE-ID]/edit`
5. Run SQL from `/workspace/cricket-arena-booking/supabase/schema.sql` (adapt for Sheets)

### **Step 3: Google Apps Script Deployment (10 min)**

1. Go to [script.google.com](https://script.google.com)
2. New Project → "Cricket Arena Backend"
3. Copy code from `/workspace/cricket-arena-booking/backend/Code.gs`
4. Paste into Script Editor
5. Update `SHEET_ID` at top of script
6. Deploy → New deployment → Web app
7. Execute as: Me
8. Who has access: Anyone
9. Deploy → Copy Web App URL

### **Step 4: Update Frontend Config (2 min)**

Edit `/workspace/cricket-arena-booking/frontend/config.js`:

```javascript
// Replace line 7:
API_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',

// Optional - Add Google Chat Webhook (line 38):
GOOGLE_CHAT_WEBHOOK: 'https://chat.googleapis.com/v1/spaces/YOUR_SPACE/messages?key=YOUR_KEY',
```

### **Step 5: Redeploy & Test (3 min)**

```bash
cd /workspace/cricket-arena-booking/frontend
# Redeploy (already done: https://ty8d9xe062ej.space.minimax.io)

# Test booking:
1. Go to booking page
2. Complete all 3 steps
3. Check Google Sheet for new booking
4. Check Gmail for confirmation email
```

---

## 🎯 ALTERNATIVE: SUPABASE BACKEND (Recommended)

If you prefer **NOT to use Google Apps Script**, you can use **Supabase** instead:

### **Supabase Advantages:**
- ✅ More powerful than Google Sheets
- ✅ Proper relational database (PostgreSQL)
- ✅ Real-time subscriptions
- ✅ Row-level security
- ✅ Better for scaling
- ✅ FREE tier: 500MB database, 2GB bandwidth/month

### **Cost:** **R 0/month** (free tier)

### **Files Ready:**
- Database schema: `/workspace/cricket-arena-booking/supabase/schema.sql`
- Edge functions: `/workspace/cricket-arena-booking/supabase/functions/`

### **Setup Time:** 20 minutes

Would you like me to help deploy with Supabase instead?

---

## 📧 EMAIL SETUP (Gmail API)

### **For Sending Booking Confirmations:**

**Option 1: Gmail API via Apps Script (Easiest)**
- No additional setup needed
- Sends from your Google account
- FREE

**Option 2: SendGrid (More Professional)**
- Custom domain emails (bookings@cricketarena.co.za)
- Better deliverability
- FREE tier: 100 emails/day
- Cost: R 0-200/month

---

## 🔐 PAYFAST INTEGRATION (Payment Processing)

### **Already Configured in Frontend:**
- PayFast sandbox mode enabled
- Ready for testing

### **To Activate Live Payments:**

1. **Sign up at PayFast:**
   - Go to [payfast.co.za](https://www.payfast.co.za)
   - Register merchant account
   - Get Merchant ID and Merchant Key

2. **Update config.js:**
```javascript
PAYFAST: {
    SANDBOX: false, // Change to false for production
    MERCHANT_ID: 'your_actual_merchant_id',
    MERCHANT_KEY: 'your_actual_merchant_key'
}
```

3. **PayFast Fees:**
   - 2.9% + R 2.00 per transaction
   - Example: R 1,000 booking = R 31 fee
   - You receive: R 969

---

## ✅ CURRENT STATUS

### **Working Now (No APIs Needed):**
- ✅ Website with all pages
- ✅ Chatbot with 7 FAQ topics
- ✅ Booking form UI (all 3 steps)
- ✅ Price calculation
- ✅ Form validation
- ✅ South African design theme
- ✅ Mobile responsive
- ✅ Video section ready

### **Pending (Needs Google APIs):**
- ⏳ Save bookings to database
- ⏳ Real availability checking
- ⏳ Email confirmations
- ⏳ Payment processing (needs PayFast activation)
- ⏳ Google Chat notifications

---

## 🆘 HELP & SUPPORT

**Need help with:**
- Google APIs setup? → [Google Cloud Quickstart](https://cloud.google.com/docs/get-started)
- Apps Script deployment? → [Apps Script Guide](https://developers.google.com/apps-script/guides/web)
- PayFast integration? → [PayFast Developer Docs](https://developers.payfast.co.za)

**Your Website:** https://ty8d9xe062ej.space.minimax.io

**Documentation:** All files in `/workspace/cricket-arena-booking/docs/`

---

## 📞 NEXT STEPS

**I recommend:**

1. **Test the chatbot** on the live site (bottom-right corner)
2. **Try the booking form** to see the full flow
3. **Decide on backend:**
   - Google Apps Script (easier, free)
   - Supabase (more powerful, free)
4. **Activate PayFast** when ready for real payments

**Let me know which backend you prefer, and I'll help you deploy it!**

---

**Summary:**
- ✅ All errors fixed
- ✅ Chatbot added with 7 topics
- ✅ Contact info updated
- ✅ Website redeployed
- 📋 Google APIs documented
- 💰 Cost: R 0/month (except PayFast fees)
