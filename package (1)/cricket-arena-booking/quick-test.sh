#!/bin/bash

echo "🚀 Performance & Backend Sync Tests" > /workspace/cricket-arena-booking/test-results.txt
echo "====================================" >> /workspace/cricket-arena-booking/test-results.txt
echo "" >> /workspace/cricket-arena-booking/test-results.txt

# Test 1: Frontend Load
echo "Test 1: Frontend Page Load" >> /workspace/cricket-arena-booking/test-results.txt
START=$(date +%s%N)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://hhvny5g8w9qx.space.minimax.io)
END=$(date +%s%N)
DURATION=$(( ($END - $START) / 1000000 ))
echo "  Status: $RESPONSE" >> /workspace/cricket-arena-booking/test-results.txt
echo "  Duration: ${DURATION}ms" >> /workspace/cricket-arena-booking/test-results.txt
if [ "$RESPONSE" = "200" ]; then
    echo "  Result: ✅ PASS" >> /workspace/cricket-arena-booking/test-results.txt
else
    echo "  Result: ❌ FAIL" >> /workspace/cricket-arena-booking/test-results.txt
fi
echo "" >> /workspace/cricket-arena-booking/test-results.txt

# Test 2: CSS Load
echo "Test 2: Static Assets (CSS)" >> /workspace/cricket-arena-booking/test-results.txt
START=$(date +%s%N)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://hhvny5g8w9qx.space.minimax.io/styles.css)
END=$(date +%s%N)
DURATION=$(( ($END - $START) / 1000000 ))
echo "  Status: $RESPONSE" >> /workspace/cricket-arena-booking/test-results.txt
echo "  Duration: ${DURATION}ms" >> /workspace/cricket-arena-booking/test-results.txt
if [ "$RESPONSE" = "200" ]; then
    echo "  Result: ✅ PASS" >> /workspace/cricket-arena-booking/test-results.txt
else
    echo "  Result: ❌ FAIL" >> /workspace/cricket-arena-booking/test-results.txt
fi
echo "" >> /workspace/cricket-arena-booking/test-results.txt

# Test 3: JS Load
echo "Test 3: Static Assets (JS)" >> /workspace/cricket-arena-booking/test-results.txt
START=$(date +%s%N)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://hhvny5g8w9qx.space.minimax.io/app.js)
END=$(date +%s%N)
DURATION=$(( ($END - $START) / 1000000 ))
echo "  Status: $RESPONSE" >> /workspace/cricket-arena-booking/test-results.txt
echo "  Duration: ${DURATION}ms" >> /workspace/cricket-arena-booking/test-results.txt
if [ "$RESPONSE" = "200" ]; then
    echo "  Result: ✅ PASS" >> /workspace/cricket-arena-booking/test-results.txt
else
    echo "  Result: ❌ FAIL" >> /workspace/cricket-arena-booking/test-results.txt
fi
echo "" >> /workspace/cricket-arena-booking/test-results.txt

# Test 4: Check Availability API
echo "Test 4: Check Availability API" >> /workspace/cricket-arena-booking/test-results.txt
TOMORROW=$(date -d "+1 day" +%Y-%m-%d)
START=$(date +%s%N)
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/availability-response.json \
  -X POST https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/check-availability \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmJjenB4cW9nZWdnbWloZGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzUwNjcsImV4cCI6MjA3NzgxMTA2N30.8zz1sPkHN9_liGBhPIqPYK6DOQQJKHV3XurhuF9ZKgQ" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmJjenB4cW9nZWdnbWloZGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzUwNjcsImV4cCI6MjA3NzgxMTA2N30.8zz1sPkHN9_liGBhPIqPYK6DOQQJKHV3XurhuF9ZKgQ" \
  -d "{\"booking_date\":\"$TOMORROW\",\"time_slot\":\"10:00\",\"duration\":2}")
END=$(date +%s%N)
DURATION=$(( ($END - $START) / 1000000 ))
echo "  Status: $RESPONSE" >> /workspace/cricket-arena-booking/test-results.txt
echo "  Duration: ${DURATION}ms" >> /workspace/cricket-arena-booking/test-results.txt
if [ "$RESPONSE" = "200" ]; then
    echo "  Result: ✅ PASS" >> /workspace/cricket-arena-booking/test-results.txt
else
    echo "  Result: ❌ FAIL" >> /workspace/cricket-arena-booking/test-results.txt
fi
echo "" >> /workspace/cricket-arena-booking/test-results.txt

# Test 5: Create Booking API
echo "Test 5: Create Booking API" >> /workspace/cricket-arena-booking/test-results.txt
FUTURE_DATE=$(date -d "+3 days" +%Y-%m-%d)
TIMESTAMP=$(date +%s)
START=$(date +%s%N)
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/booking-response.json \
  -X POST https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/create-booking \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmJjenB4cW9nZWdnbWloZGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzUwNjcsImV4cCI6MjA3NzgxMTA2N30.8zz1sPkHN9_liGBhPIqPYK6DOQQJKHV3XurhuF9ZKgQ" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmJjenB4cW9nZWdnbWloZGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzUwNjcsImV4cCI6MjA3NzgxMTA2N30.8zz1sPkHN9_liGBhPIqPYK6DOQQJKHV3XurhuF9ZKgQ" \
  -d "{\"customer_name\":\"PerfTest$TIMESTAMP\",\"email\":\"test$TIMESTAMP@example.com\",\"phone\":\"0812345678\",\"booking_date\":\"$FUTURE_DATE\",\"time_slot\":\"14:00\",\"duration\":2}")
END=$(date +%s%N)
DURATION=$(( ($END - $START) / 1000000 ))
echo "  Status: $RESPONSE" >> /workspace/cricket-arena-booking/test-results.txt
echo "  Duration: ${DURATION}ms" >> /workspace/cricket-arena-booking/test-results.txt
if [ "$RESPONSE" = "200" ]; then
    echo "  Result: ✅ PASS" >> /workspace/cricket-arena-booking/test-results.txt
else
    echo "  Result: ❌ FAIL" >> /workspace/cricket-arena-booking/test-results.txt
fi
echo "" >> /workspace/cricket-arena-booking/test-results.txt

echo "====================================" >> /workspace/cricket-arena-booking/test-results.txt
echo "📊 All tests completed!" >> /workspace/cricket-arena-booking/test-results.txt
echo "Check results above for performance metrics" >> /workspace/cricket-arena-booking/test-results.txt

