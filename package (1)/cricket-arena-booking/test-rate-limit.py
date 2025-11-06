import requests
import json
import time

BASE_URL = "https://szrbczpxqogeggmihdbt.supabase.co/functions/v1/create-booking"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmJjenB4cW9nZWdnbWloZGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzUwNjcsImV4cCI6MjA3NzgxMTA2N30.8zz1sPkHN9_liGBhPIqPYK6DOQQJKHV3XurhuF9ZKgQ"

headers = {
    "Content-Type": "application/json",
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}"
}

print("=" * 60)
print("TESTING RATE LIMITING (5 bookings per hour per email)")
print("=" * 60)
print()

EMAIL = "ratelimit@test.com"

for i in range(1, 7):
    data = {
        "customer_name": f"Rate Test User {i}",
        "email": EMAIL,
        "phone": "0123456789",
        "booking_date": "2025-11-20",
        "time_slot": f"{8 + i}:00",
        "duration": 1
    }
    
    try:
        response = requests.post(BASE_URL, headers=headers, json=data)
        result = response.json()
        
        if i <= 5:
            if response.status_code == 200:
                print(f"Request {i}/6: ✅ Accepted (ID: {result.get('data', {}).get('booking', {}).get('id', 'N/A')[:8]}...)")
            else:
                print(f"Request {i}/6: ⚠️  {result.get('error', {}).get('message', 'Unknown error')}")
        else:
            if "Too many booking requests" in result.get('error', {}).get('message', ''):
                print(f"Request {i}/6: ✅ BLOCKED - Rate limit enforced!")
                print(f"             Message: {result['error']['message']}")
            else:
                print(f"Request {i}/6: ❌ Should have been rate limited")
                print(f"             Response: {json.dumps(result, indent=2)}")
        
        time.sleep(0.3)
        
    except Exception as e:
        print(f"Request {i}/6: Error - {str(e)}")

print()
print("=" * 60)
print("RATE LIMIT TEST COMPLETE")
print("=" * 60)
