# Cricket Arena Booking System - Setup Checklist

Use this checklist to ensure complete and correct deployment.

## Pre-Deployment Checklist

### Phase 1: Google Sheets Setup
- [ ] Create new Google Sheet
- [ ] Copy Spreadsheet ID from URL
- [ ] Keep browser tab open for later

### Phase 2: Google Apps Script Setup
- [ ] Go to script.google.com
- [ ] Create new project: "Cricket Arena Booking Backend"
- [ ] Copy contents of `backend/Code.gs`
- [ ] Paste into script editor
- [ ] Update CONFIG.SPREADSHEET_ID with your Sheet ID
- [ ] Add PayFast credentials (use sandbox for testing)
- [ ] Save script (Ctrl+S / Cmd+S)
- [ ] Run `setupDatabase` function
- [ ] Authorize script when prompted
- [ ] Verify 5 sheets created in Google Sheet
- [ ] Deploy as Web App (Execute as: Me, Access: Anyone)
- [ ] Copy Web App URL
- [ ] Test: Visit URL + "?action=getPitches"

### Phase 3: PayFast Setup
- [ ] Sign up at sandbox.payfast.co.za (for testing)
- [ ] Login to PayFast sandbox dashboard
- [ ] Go to Settings > Integration
- [ ] Copy Merchant ID and Merchant Key
- [ ] Update backend Code.gs with credentials
- [ ] Update frontend config.js with credentials
- [ ] Set IPN Notify URL in PayFast dashboard

### Phase 4: Google Chat Setup (Optional)
- [ ] Create Google Chat space
- [ ] Add webhook to space
- [ ] Copy webhook URL
- [ ] Update backend CONFIG.GOOGLE_CHAT_WEBHOOK
- [ ] Update frontend config.js GOOGLE_CHAT_WEBHOOK

### Phase 5: Frontend Configuration
- [ ] Edit `frontend/config.js`
- [ ] Set API_URL to your Google Apps Script URL
- [ ] Set PAYFAST.MERCHANT_ID
- [ ] Set PAYFAST.MERCHANT_KEY
- [ ] Set PAYFAST.SANDBOX to true (for testing)
- [ ] Update RETURN_URL (after you know your domain)
- [ ] Update CANCEL_URL (after you know your domain)
- [ ] Update NOTIFY_URL with your Apps Script URL

### Phase 6: Frontend Deployment
- [ ] Choose hosting service (GitHub Pages / Netlify / Vercel)
- [ ] Upload all files from `frontend/` folder
- [ ] Wait for deployment to complete
- [ ] Note your website URL
- [ ] Update config.js with actual domain URLs
- [ ] Re-upload updated config.js

### Phase 7: Final PayFast Configuration
- [ ] Login to PayFast dashboard
- [ ] Update Return URL to your payment-success.html
- [ ] Update Cancel URL to your payment-cancel.html
- [ ] Save changes

### Phase 8: Testing
- [ ] Visit your website
- [ ] Verify pitches load correctly
- [ ] Test date/time picker
- [ ] Check availability for a slot
- [ ] Fill out booking form
- [ ] Submit and proceed to payment
- [ ] Complete test payment (use sandbox)
- [ ] Verify redirection to success page
- [ ] Check Google Sheet for new booking
- [ ] Check Transactions sheet for payment record
- [ ] Verify Google Chat notification received

### Phase 9: Go Live (After Testing)
- [ ] Switch PayFast from sandbox to live
- [ ] Update PayFast credentials (live mode)
- [ ] Set PAYFAST.SANDBOX to false
- [ ] Re-deploy frontend
- [ ] Test with small real payment
- [ ] Monitor first few bookings closely

## Configuration Values to Record

| Item | Value | Where to Use |
|------|-------|--------------|
| Google Sheet ID | __________________ | backend/Code.gs |
| Apps Script URL | __________________ | frontend/config.js |
| PayFast Merchant ID | __________________ | Both configs |
| PayFast Merchant Key | __________________ | Both configs |
| Google Chat Webhook | __________________ | Both configs |
| Website URL | __________________ | config.js, PayFast |

## Testing Checklist

### Functional Testing
- [ ] Homepage loads without errors
- [ ] All sections scroll smoothly
- [ ] Facilities section shows 3 pitches
- [ ] Pricing section displays correctly
- [ ] Booking form opens
- [ ] Date picker works (limits to 60 days ahead)
- [ ] Time slots populate
- [ ] Pitch selection works
- [ ] Availability check responds
- [ ] Step navigation works (Next/Back buttons)
- [ ] Form validation prevents empty fields
- [ ] Email validation works
- [ ] Phone validation works
- [ ] Price calculation is correct (includes VAT)
- [ ] Review step shows all data correctly
- [ ] Payment submission works
- [ ] PayFast page loads
- [ ] Payment can be completed
- [ ] Success page shows booking reference
- [ ] Cancel flow works
- [ ] Data appears in Google Sheet
- [ ] Transaction logged correctly
- [ ] Google Chat notification sent

### Browser Testing
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Edge (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (mobile)

### Responsive Testing
- [ ] Desktop (1920px)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

### Performance Testing
- [ ] Page load time < 2 seconds
- [ ] Booking submission < 3 seconds
- [ ] No console errors
- [ ] All images load correctly
- [ ] Smooth animations

## Common Issues and Solutions

### Issue: API_URL not configured warning
**Solution**: Update config.js with your Google Apps Script URL

### Issue: Pitches not loading
**Solution**: 
1. Check Apps Script deployment is set to "Anyone"
2. Verify Spreadsheet ID is correct
3. Ensure setupDatabase was run

### Issue: PayFast redirect not working
**Solution**:
1. Verify SANDBOX mode matches URL (sandbox vs live)
2. Check PayFast credentials
3. Ensure return URLs are correct

### Issue: Payment doesn't update booking
**Solution**:
1. Check IPN Notify URL in PayFast
2. Verify Apps Script has permission to write to sheet
3. Check Apps Script execution logs

### Issue: Console errors about CORS
**Solution**: Ensure Apps Script deployment access is set to "Anyone"

## Post-Launch Monitoring

### Daily (First Week)
- [ ] Check for new bookings in Google Sheet
- [ ] Verify payments match bookings
- [ ] Monitor Google Chat notifications
- [ ] Respond to customer inquiries
- [ ] Check Apps Script quota usage

### Weekly
- [ ] Review PayFast transaction reports
- [ ] Backup Google Sheet data
- [ ] Check for any error patterns
- [ ] Review customer feedback

### Monthly
- [ ] Reconcile all payments
- [ ] Review and update pricing if needed
- [ ] Analyze booking patterns
- [ ] Plan improvements

## Support Contacts

### Technical Issues
- Google Apps Script: https://developers.google.com/apps-script
- PayFast Support: 0861 729 227 / support@payfast.co.za
- Google Workspace: https://support.google.com/

### Documentation
- Deployment Guide: docs/DEPLOYMENT.md
- Configuration Guide: docs/CONFIGURATION.md
- User Manual: docs/USER_MANUAL.md
- Technical Docs: docs/TECHNICAL.md

## Rollback Procedure

If something goes wrong:

1. **Frontend**: Revert to previous version on hosting
2. **Backend**: Apps Script > Deploy > Manage deployments > Archive current
3. **Database**: Google Sheets > File > Version history > Restore

## Success Criteria

Your deployment is successful when:
- [ ] Website is accessible from any device
- [ ] Bookings are created in Google Sheet
- [ ] Payments are processed through PayFast
- [ ] Notifications are sent via Google Chat
- [ ] No console errors in browser
- [ ] All links work correctly
- [ ] Mobile experience is smooth
- [ ] Payment flow completes successfully

---

**Need Help?**
Review the documentation in the `docs/` folder for detailed guidance.

**Ready to Launch?**
Complete all checklist items, test thoroughly, then announce your booking system to customers!

---

Version 1.0 | November 2025
