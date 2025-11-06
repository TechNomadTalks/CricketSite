#!/bin/bash

ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmJjenB4cW9nZWdnbWloZGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzUwNjcsImV4cCI6MjA3NzgxMTA2N30.8zz1sPkHN9_liGBhPIqPYK6DOQQJKHV3XurhuF9ZKgQ"
BASE_URL="https://szrbczpxqogeggmihdbt.supabase.co/functions/v1"

echo "═══════════════════════════════════════════════════"
echo "SECURITY AUDIT ROUND 2 - RUTHLESS PENETRATION TEST"
echo "═══════════════════════════════════════════════════"
echo ""

echo "[TEST 1] XSS Attack - IMG Tag with onerror"
echo "─────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/create-booking" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "customer_name": "<img src=x onerror=alert(\"XSS\")>",
    "email": "xss1@test.com",
    "phone": "0123456789",
    "booking_date": "2025-11-10",
    "time_slot": "10:00",
    "duration": 1
  }' | jq -r 'if .data then "❌ CRITICAL: XSS payload stored! ID: " + .data.id else "✅ BLOCKED: " + (.error.message // "Request rejected") end'
echo ""

echo "[TEST 2] XSS Attack - SVG with onload"
echo "─────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/create-booking" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "customer_name": "<svg/onload=alert(\"XSS\")>",
    "email": "xss2@test.com",
    "phone": "0123456789",
    "booking_date": "2025-11-10",
    "time_slot": "11:00",
    "duration": 1
  }' | jq -r 'if .data then "❌ CRITICAL: XSS payload stored!" else "✅ BLOCKED: " + (.error.message // "Request rejected") end'
echo ""

echo "[TEST 3] SQL Injection - DROP TABLE"
echo "─────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/create-booking" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "customer_name": "'; DROP TABLE bookings; --",
    "email": "sqli@test.com",
    "phone": "0123456789",
    "booking_date": "2025-11-10",
    "time_slot": "12:00",
    "duration": 1
  }' | jq -r 'if .data then "✅ SANITIZED: Stored safely" else "✅ REJECTED: " + (.error.message // "Request rejected") end'
echo ""

echo "[TEST 4] SQL Injection - UNION SELECT"
echo "─────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/create-booking" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "customer_name": "admin' UNION SELECT * FROM admin_users--",
    "email": "union@test.com",
    "phone": "0123456789",
    "booking_date": "2025-11-10",
    "time_slot": "13:00",
    "duration": 1
  }' | jq -r 'if .data then "✅ SANITIZED: Stored safely" else "✅ REJECTED: " + (.error.message // "Request rejected") end'
echo ""

echo "[TEST 5] Authentication Bypass - Admin Endpoint Access"
echo "─────────────────────────────────────────────────"
curl -s -X GET "$BASE_URL/get-bookings" \
  -H "apikey: $ANON_KEY" | jq -r 'if .data then "❌ CRITICAL: Admin data accessible without auth!" else "✅ SECURE: " + (.error.message // "Access denied") end'
echo ""

echo "[TEST 6] Authorization Bypass - Status Update Without Admin"
echo "─────────────────────────────────────────────────"
curl -s -X PATCH "$BASE_URL/update-booking-status" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "booking_id": "00000000-0000-0000-0000-000000000000",
    "status": "confirmed"
  }' | jq -r 'if .data then "❌ CRITICAL: Non-admin can update status!" else "✅ SECURE: " + (.error.message // "Access denied") end'
echo ""

echo "[TEST 7] Data Validation - Negative Duration"
echo "─────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/create-booking" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "customer_name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "booking_date": "2025-11-10",
    "time_slot": "14:00",
    "duration": -5
  }' | jq -r 'if .data then "⚠️  WARNING: Negative duration accepted!" else "✅ REJECTED: " + (.error.message // "Invalid duration") end'
echo ""

echo "[TEST 8] Data Validation - Zero Duration"
echo "─────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/create-booking" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "customer_name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "booking_date": "2025-11-10",
    "time_slot": "15:00",
    "duration": 0
  }' | jq -r 'if .data then "⚠️  WARNING: Zero duration accepted!" else "✅ REJECTED: " + (.error.message // "Invalid duration") end'
echo ""

echo "[TEST 9] Data Validation - Invalid Time Format"
echo "─────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/create-booking" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "customer_name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "booking_date": "2025-11-10",
    "time_slot": "99:99",
    "duration": 1
  }' | jq -r 'if .data then "⚠️  WARNING: Invalid time accepted!" else "✅ REJECTED: " + (.error.message // "Invalid time") end'
echo ""

echo "[TEST 10] Data Validation - Excessive Duration (100 hours)"
echo "─────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/create-booking" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "customer_name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "booking_date": "2025-11-10",
    "time_slot": "16:00",
    "duration": 100
  }' | jq -r 'if .data then "⚠️  WARNING: Excessive duration accepted!" else "✅ REJECTED: " + (.error.message // "Duration too long") end'
echo ""

echo "[TEST 11] Email Validation - Multiple @ symbols"
echo "─────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/create-booking" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "customer_name": "Test User",
    "email": "test@@example@.com",
    "phone": "0123456789",
    "booking_date": "2025-11-10",
    "time_slot": "17:00",
    "duration": 1
  }' | jq -r 'if .data then "⚠️  WARNING: Invalid email accepted!" else "✅ REJECTED: " + (.error.message // "Invalid email") end'
echo ""

echo "[TEST 12] Past Date Validation"
echo "─────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/create-booking" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "customer_name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "booking_date": "2020-01-01",
    "time_slot": "10:00",
    "duration": 1
  }' | jq -r 'if .data then "⚠️  WARNING: Past date accepted!" else "✅ REJECTED: " + (.error.message // "Past date") end'
echo ""

echo "═══════════════════════════════════════════════════"
echo "CHECKING DATABASE FOR TEST DATA..."
echo "═══════════════════════════════════════════════════"
