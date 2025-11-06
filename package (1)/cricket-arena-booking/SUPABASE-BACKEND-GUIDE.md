# Supabase Backend Implementation Guide
## Cricket Arena Booking System

## Overview
This document provides complete information about the Supabase backend implementation for the Cricket Arena booking system.

## Database Schema

### Tables

#### 1. `bookings` Table
Stores all customer bookings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| customer_name | TEXT | Customer's full name |
| email | TEXT | Customer's email address |
| phone | TEXT | Customer's phone number |
| booking_date | DATE | Date of booking |
| time_slot | TEXT | Time slot (format: "HH:00") |
| duration | INTEGER | Duration in hours |
| total_price | NUMERIC | Total price (duration × R350) |
| status | TEXT | Status: 'pending', 'confirmed', or 'cancelled' |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### 2. `admin_users` Table
Stores authorized admin email addresses.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| email | TEXT | Admin email address (unique) |
| created_at | TIMESTAMP | Record creation timestamp |

**Authorized Admins:**
- imraan@coas.co.za
- luke@l-inc.co.za

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

**bookings table:**
- INSERT: Public access (anyone can create bookings)
- SELECT: Admin users only
- UPDATE: Admin users only
- DELETE: Admin users only

**admin_users table:**
- SELECT: Admin users only

## Edge Functions

### 1. check-availability
**Endpoint:** `https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/check-availability`

**Purpose:** Check if a time slot is available for booking

**Method:** POST

**Request Body:**
```json
{
  "booking_date": "2025-11-10",
  "time_slot": "14:00",
  "duration": 2
}
```

**Response (Available):**
```json
{
  "data": {
    "available": true,
    "message": "Time slot is available"
  }
}
```

**Response (Not Available):**
```json
{
  "data": {
    "available": false,
    "message": "This time slot is already booked"
  }
}
```

### 2. create-booking
**Endpoint:** `https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/create-booking`

**Purpose:** Create a new booking

**Method:** POST

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "email": "john@example.com",
  "phone": "0123456789",
  "booking_date": "2025-11-10",
  "time_slot": "10:00",
  "duration": 2
}
```

**Response (Success):**
```json
{
  "data": {
    "success": true,
    "booking": {
      "id": "5e445a93-51db-4fa5-a0e4-52fab52e757a",
      "customer_name": "John Doe",
      "email": "john@example.com",
      "phone": "0123456789",
      "booking_date": "2025-11-10",
      "time_slot": "10:00",
      "duration": 2,
      "total_price": 700,
      "status": "pending",
      "created_at": "2025-11-04T07:38:50.276098+00:00"
    },
    "message": "Booking created successfully! A confirmation has been sent to the arena management."
  }
}
```

### 3. get-bookings (Admin Only)
**Endpoint:** `https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/get-bookings`

**Purpose:** Retrieve all bookings with optional filtering

**Method:** GET

**Authentication:** Requires admin login token

**Query Parameters:**
- `status` (optional): Filter by status ('pending', 'confirmed', 'cancelled', or 'all')
- `start_date` (optional): Filter bookings from this date
- `end_date` (optional): Filter bookings until this date

**Example:**
```
GET /get-bookings?status=pending
```

**Response:**
```json
{
  "data": {
    "bookings": [
      {
        "id": "5e445a93-51db-4fa5-a0e4-52fab52e757a",
        "customer_name": "John Doe",
        "email": "john@example.com",
        "phone": "0123456789",
        "booking_date": "2025-11-10",
        "time_slot": "10:00",
        "duration": 2,
        "total_price": 700,
        "status": "pending",
        "created_at": "2025-11-04T07:38:50.276098+00:00",
        "updated_at": "2025-11-04T07:38:50.276098+00:00"
      }
    ],
    "count": 1
  }
}
```

### 4. update-booking-status (Admin Only)
**Endpoint:** `https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/update-booking-status`

**Purpose:** Update booking status (confirm/cancel)

**Method:** POST

**Authentication:** Requires admin login token

**Request Body:**
```json
{
  "booking_id": "5e445a93-51db-4fa5-a0e4-52fab52e757a",
  "status": "confirmed"
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "booking": {
      "id": "5e445a93-51db-4fa5-a0e4-52fab52e757a",
      "status": "confirmed",
      ...
    },
    "message": "Booking status updated to confirmed"
  }
}
```

## Admin Access Setup

### Step 1: Create Admin Accounts in Supabase

The admin users are already added to the `admin_users` table. Now they need to be created in Supabase Auth:

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to Authentication > Users
4. Click "Invite User" for each admin:
   - **Email:** imraan@coas.co.za
   - **Email:** luke@l-inc.co.za
5. Set a temporary password or send invite link
6. Admins will receive an email to set their password

### Step 2: Admin Login

Admins can access the dashboard at:
**URL:** https://[your-deployment-url]/admin.html

**Login Credentials:**
- Use the email and password set in Supabase Auth
- Only authorized emails (listed in `admin_users` table) can access bookings

## Frontend Integration

### Configuration
All Supabase credentials are configured in `config.js`:

```javascript
const CONFIG = {
    SUPABASE_URL: 'https://szrbczpxqogeggmihdbt.supabase.co',
    SUPABASE_ANON_KEY: '[anon-key]',
    EDGE_FUNCTIONS: {
        CHECK_AVAILABILITY: '[url]',
        CREATE_BOOKING: '[url]',
        GET_BOOKINGS: '[url]',
        UPDATE_BOOKING_STATUS: '[url]'
    },
    ARENA: {
        HOURLY_RATE: 350,
        ...
    }
};
```

### Booking Flow

1. **Customer selects date/time** → Frontend calls `check-availability`
2. **Customer fills details** → Form validation
3. **Customer submits** → Frontend calls `create-booking`
4. **Success** → Confirmation modal displayed
5. **Notification** → Edge function logs notification (email integration can be added)

### Admin Flow

1. **Admin logs in** → Supabase Auth verifies credentials
2. **Dashboard loads** → Calls `get-bookings` with auth token
3. **Admin updates status** → Calls `update-booking-status` with auth token
4. **Real-time updates** → Dashboard refreshes

## Testing Instructions

### Test Customer Booking

1. Visit: https://[your-deployment-url]/booking.html
2. Select a future date
3. Choose a time slot (07:00 - 22:00)
4. Select duration (1-10 hours)
5. Click "Check Availability"
6. Fill in contact details
7. Submit booking
8. Verify confirmation modal appears

### Test Admin Dashboard

1. Visit: https://[your-deployment-url]/admin.html
2. Login with admin credentials
3. Verify bookings list loads
4. Test status filter (All/Pending/Confirmed/Cancelled)
5. Confirm a pending booking
6. Verify status updates in table
7. Refresh to ensure changes persist

## Maintenance Guide

### View Bookings in Database

1. Go to Supabase Dashboard
2. Navigate to Table Editor > bookings
3. View all records with filters

### Add New Admin

```sql
INSERT INTO admin_users (email) VALUES ('newemail@example.com');
```

Then create the user in Supabase Auth.

### Check Edge Function Logs

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Select function name
4. View Logs tab for errors/debugging

### Common Issues

**Issue:** "Invalid authentication token"
**Solution:** Admin needs to log out and log back in

**Issue:** "Time slot already booked"
**Solution:** Another booking exists for that date/time. Check database or choose different time.

**Issue:** Edge function returns 500 error
**Solution:** Check Edge Function logs in Supabase Dashboard

## Pricing

**Arena Rate:** R 350 per hour
**Example Calculation:**
- 2 hours = R 700
- 3 hours = R 1,050
- 5 hours = R 1,750

## Security Features

1. **Row Level Security (RLS):** Ensures data access control at database level
2. **Admin Authentication:** Only authorized users can access admin functions
3. **Input Validation:** All inputs validated server-side in edge functions
4. **CORS Headers:** Properly configured for frontend access
5. **Prepared Statements:** All database queries use safe parameterization

## Deployment Status

**Database:** ✅ Deployed
**Edge Functions:** ✅ All 4 functions deployed and tested
**Frontend:** ⏳ Ready for deployment
**Admin Dashboard:** ✅ Created

## Next Steps

1. Deploy frontend to production
2. Create admin accounts in Supabase Auth
3. Test complete booking flow
4. Monitor Edge Function logs for any issues
5. (Optional) Integrate email service for automated notifications

## Support

For issues or questions:
- Email: imraan@coas.co.za
- Check Supabase Dashboard logs
- Review this documentation

---

**Last Updated:** 2025-11-04
**Backend Status:** Fully Operational
