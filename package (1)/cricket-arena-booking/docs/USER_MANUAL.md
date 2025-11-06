# User Manual - Cricket Arena Booking System

This manual explains how to use and manage the Cricket Arena Booking System from both customer and administrator perspectives.

## Table of Contents

1. [Customer Guide](#customer-guide)
2. [Administrator Guide](#administrator-guide)
3. [Managing Bookings](#managing-bookings)
4. [Payment Management](#payment-management)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)

---

## Customer Guide

### Making a Booking

#### Step 1: Browse Facilities

1. Visit the website homepage
2. Scroll to the "Facilities" section
3. Review available cricket pitches:
   - **Professional Turf Pitch**: Premium natural turf for competitive matches
   - **Astro Turf Pitch**: All-weather synthetic surface
   - **Training Nets Area**: Practice nets for training sessions

Each facility shows:
- Hourly rate
- Capacity
- Features and amenities
- Description

#### Step 2: Start Booking Process

1. Click "Book Now" button (navigation or any "Book This Pitch" button)
2. You'll be taken to the booking form

#### Step 3: Select Date, Time & Pitch

Fill in the following:
- **Booking Date**: Choose from available dates (up to 60 days ahead)
- **Time Slot**: Select your preferred time (6 AM - 10 PM slots)
- **Duration**: Choose hours needed (1-6 hours)
- **Pitch**: Select which pitch to book

Click "Check Availability" to verify the slot is available.

**Green message**: Pitch is available - proceed to next step
**Warning message**: Slot is booked - try different time/date

Click "Next" to continue.

#### Step 4: Enter Team Details

Provide your team information:
- **Team Name**: Your cricket team or organization name
- **Number of Players**: How many people will be playing
- **Contact Name**: Primary contact person
- **Contact Phone**: Mobile number (include country code)
- **Email Address**: For booking confirmation
- **Booking Type**: 
  - Practice Session
  - Casual Match
  - Tournament
  - Team Training
  - Special Event
- **Special Requirements** (optional): Any specific needs or equipment

Click "Next" to review.

#### Step 5: Review & Payment

Review your booking details:
- Date and time
- Duration
- Pitch name
- Team information
- Pricing breakdown:
  - Subtotal
  - VAT (15%)
  - Total amount

If everything is correct, click "Proceed to Payment".

#### Step 6: Complete Payment

You'll be redirected to PayFast (secure payment gateway):

1. Choose payment method:
   - Credit/Debit Card
   - Instant EFT
   - SnapScan
   - Other supported methods
2. Enter payment details
3. Confirm payment

#### Step 7: Confirmation

After successful payment:
- You'll be redirected to confirmation page
- Booking reference number will be displayed
- You'll receive:
  - Email confirmation
  - Google Chat notification (if configured)

Save your booking reference number for future reference.

### Modifying a Booking

**Currently**: Modifications require contacting the administrator directly.

**Contact Methods**:
- Email: bookings@cricketarena.co.za
- Phone: +27 11 123 4567
- Include your booking reference number

### Cancelling a Booking

To cancel a booking:
1. Contact administrator with booking reference
2. Cancellation policy applies:
   - 48+ hours notice: Full refund
   - 24-48 hours: 50% refund
   - Less than 24 hours: No refund
   (Update based on your actual policy)

---

## Administrator Guide

### Accessing the Admin Panel

Currently, administration is done through Google Sheets.

**To access**:
1. Open your Google Sheet: "Cricket Arena Booking Database"
2. You'll see 5 tabs:
   - Bookings
   - Pitches
   - TimeSlots
   - Settings
   - Transactions

### Understanding the Bookings Sheet

Columns explained:

| Column | Description |
|--------|-------------|
| booking_id | Unique booking identifier |
| date | Booking date |
| time_slot | Selected time slot |
| duration | Number of hours |
| team_name | Customer's team name |
| players_count | Number of players |
| contact_name | Contact person |
| contact_phone | Phone number |
| contact_email | Email address |
| party_type | Type of booking |
| pitch_id | Which pitch (1, 2, or 3) |
| price | Total amount |
| status | pending/confirmed/cancelled |
| timestamp | When booking was created |
| payment_status | pending/paid/refunded |
| special_requirements | Customer notes |

### Dashboard View

**Recommended**: Create a dashboard view in Google Sheets

1. Click "Data" > "Pivot table"
2. Select "Bookings" as source
3. Add fields:
   - Rows: date
   - Values: COUNT of booking_id
   - Filter: status = confirmed

This shows bookings per day.

---

## Managing Bookings

### Viewing Today's Bookings

1. Open Bookings sheet
2. Click "Data" > "Create a filter"
3. Click filter icon on "date" column
4. Select today's date
5. View all bookings for today

### Confirming Bookings

Bookings are auto-confirmed after payment. Manual confirmation:

1. Find booking row
2. Change "status" to "confirmed"
3. Change "payment_status" to "paid"
4. Customer will see updated status

### Cancelling Bookings

To cancel a booking:

1. Find booking in Bookings sheet
2. Change "status" column to "cancelled"
3. Update "payment_status" to "refunded" (if applicable)
4. Process refund in PayFast dashboard
5. Contact customer to confirm cancellation

### Rescheduling Bookings

1. Find original booking
2. Update:
   - date
   - time_slot
3. Contact customer to confirm change
4. No payment adjustment needed unless price changes

---

## Payment Management

### Viewing Transactions

1. Open Transactions sheet
2. View all PayFast payment records
3. Match transaction_id with booking_id

### Reconciling Payments

Daily reconciliation:

1. Open Transactions sheet
2. Filter by today's date
3. Cross-check with Bookings sheet
4. Verify:
   - Each paid booking has a transaction
   - Transaction amounts match booking prices
   - All statuses are correct

### Processing Refunds

Via PayFast dashboard:

1. Login to PayFast
2. Go to Transactions
3. Find the transaction
4. Click "Refund"
5. Enter refund amount
6. Confirm refund
7. Update booking status in sheet

---

## Common Tasks

### Adding a New Pitch

1. Open Pitches sheet
2. Add new row with:
   - Next pitch_id (e.g., 4)
   - Pitch name
   - Capacity
   - Hourly rate
   - Description
   - active_flag: TRUE
3. Pitch will appear on website immediately

### Updating Pricing

To change pitch rates:

1. Open Pitches sheet
2. Update "hourly_rate" column
3. New bookings will use updated price
4. Existing bookings unchanged

### Changing Operating Hours

1. Edit `frontend/config.js`
2. Update TIME_SLOTS array
3. Add or remove time slots
4. Re-upload to hosting

### Viewing Reports

**Monthly Revenue**:
1. Open Bookings sheet
2. Filter by month
3. Sum "price" column
4. Compare with PayFast reports

**Popular Times**:
1. Create pivot table
2. Rows: time_slot
3. Values: COUNT of booking_id
4. Sort descending

**Pitch Utilization**:
1. Create pivot table
2. Rows: pitch_id
3. Values: SUM of duration
4. Calculate percentage of available hours

---

## Customer Communication

### Booking Confirmation

**Automatic**:
- Google Chat notification (if configured)
- Can add email via Apps Script

**Manual**:
- Copy customer email from Bookings sheet
- Send confirmation with:
  - Booking reference
  - Date and time
  - Pitch details
  - Directions
  - Contact number

### Reminders

**24 Hours Before**:

Template:
```
Subject: Reminder: Cricket Arena Booking Tomorrow

Hi [team_name],

This is a reminder for your booking:

Date: [date]
Time: [time_slot]
Duration: [duration] hours
Pitch: [pitch_name]
Booking Ref: [booking_id]

Location: 123 Cricket Avenue, Johannesburg

Contact: +27 11 123 4567

See you tomorrow!

Cricket Arena Team
```

### Post-Booking Follow-up

After booking (optional):
```
Subject: Thank You for Booking with Cricket Arena

Hi [team_name],

Thank you for choosing Cricket Arena!

We hope you enjoyed your session. We'd love to hear your feedback.

Book again: [website_url]

Best regards,
Cricket Arena Team
```

---

## Troubleshooting

### Customer Can't Complete Booking

**Check**:
1. Is the pitch available in the sheet?
2. Is the website accessible?
3. Is PayFast service operational?
4. Check Google Apps Script quota

**Solution**:
- Verify no conflicting bookings
- Test payment flow yourself
- Check Apps Script logs

### Payment Received But Booking Not Updated

**Check**:
1. PayFast IPN notifications in Transactions sheet
2. Apps Script execution log
3. PayFast merchant dashboard

**Solution**:
- Manually update booking status
- Verify IPN URL in PayFast settings
- Contact customer to confirm

### Customer Didn't Receive Confirmation

**Check**:
1. Email address in Bookings sheet
2. Spam folder
3. Google Chat notifications

**Solution**:
- Resend confirmation manually
- Verify contact details
- Call customer to confirm

### Duplicate Bookings

**Cause**: User clicked submit multiple times

**Prevention**:
- Loading overlay prevents double-clicks
- Check for duplicates before confirming

**Solution**:
- Cancel duplicate booking
- Refund extra payment
- Confirm with customer

---

## Best Practices

### For Administrators

1. **Check bookings daily**: Review morning and evening
2. **Respond quickly**: Reply to inquiries within 24 hours
3. **Keep data clean**: Remove old cancelled bookings quarterly
4. **Backup regularly**: Download Sheet as Excel weekly
5. **Monitor payments**: Reconcile daily
6. **Update availability**: Mark pitch unavailable for maintenance

### For Customers

1. **Book early**: Popular times fill up fast
2. **Arrive 15 minutes early**: Time to check in
3. **Bring confirmation**: Either email or booking reference
4. **Check weather**: For outdoor pitches
5. **Contact for changes**: Don't just not show up

---

## Support

### For Customers

**Email**: bookings@cricketarena.co.za
**Phone**: +27 11 123 4567
**Hours**: Mon-Sun, 6 AM - 10 PM

### For Administrators

**Technical Issues**:
- Check Google Apps Script logs
- Review PayFast merchant portal
- Verify Google Sheets permissions

**Payment Issues**:
- Contact PayFast support
- Phone: 0861 729 227
- Email: support@payfast.co.za

---

## Appendix

### Booking Status Reference

| Status | Meaning |
|--------|---------|
| pending | Awaiting payment |
| confirmed | Paid and confirmed |
| cancelled | Cancelled by customer/admin |
| completed | Booking date has passed |
| no-show | Customer didn't arrive |

### Payment Status Reference

| Status | Meaning |
|--------|---------|
| pending | Payment not yet received |
| paid | Payment successful |
| failed | Payment failed |
| refunded | Payment refunded |

### Booking Type Reference

| Type | Description |
|------|-------------|
| practice | Practice session |
| match | Casual match |
| tournament | Tournament event |
| training | Team training |
| event | Special event |

---

## Quick Reference

**Customer Booking Flow**:
Browse → Select → Details → Review → Pay → Confirm

**Admin Daily Tasks**:
Check bookings → Respond to inquiries → Reconcile payments → Update sheet

**Emergency Contacts**:
- Admin: [Your phone]
- Technical: [Your email]
- PayFast: 0861 729 227

---

This manual is version 1.0. Last updated: November 2025
