/**
 * Cricket Arena Booking System - Google Apps Script Backend
 * 
 * This script handles:
 * - Database operations with Google Sheets
 * - Booking management and availability checking
 * - PayFast payment integration
 * - Google Chat notifications
 * - API endpoints for frontend communication
 */

// Configuration
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE', // Replace with your Google Sheet ID
  PAYFAST: {
    MERCHANT_ID: 'YOUR_MERCHANT_ID',
    MERCHANT_KEY: 'YOUR_MERCHANT_KEY',
    PASSPHRASE: 'YOUR_PASSPHRASE' // Optional but recommended
  },
  GOOGLE_CHAT_WEBHOOK: 'YOUR_GOOGLE_CHAT_WEBHOOK_URL', // Optional
  VAT_RATE: 0.15,
  TIMEZONE: 'Africa/Johannesburg'
};

// Sheet names
const SHEETS = {
  BOOKINGS: 'Bookings',
  PITCHES: 'Pitches',
  TIME_SLOTS: 'TimeSlots',
  SETTINGS: 'Settings',
  TRANSACTIONS: 'Transactions'
};

/**
 * Main entry point for web app
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'getPitches':
        return jsonResponse(getPitches());
        
      case 'getTimeSlots':
        return jsonResponse(getTimeSlots());
        
      case 'payfast_notify':
        // PayFast IPN notification
        return handlePayFastNotification(e);
        
      default:
        return jsonResponse({
          success: false,
          message: 'Invalid action'
        });
    }
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.toString()
    });
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = e.parameter.action || params.action;
    
    switch(action) {
      case 'checkAvailability':
        return jsonResponse(checkAvailability(params));
        
      case 'createBooking':
        return jsonResponse(createBooking(params));
        
      case 'payfast_notify':
        return handlePayFastNotification(e);
        
      default:
        return jsonResponse({
          success: false,
          message: 'Invalid action'
        });
    }
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.toString()
    });
  }
}

/**
 * Get spreadsheet
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

/**
 * Get sheet by name
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheet, sheetName);
  }
  
  return sheet;
}

/**
 * Initialize sheet with headers
 */
function initializeSheet(sheet, sheetName) {
  let headers = [];
  
  switch(sheetName) {
    case SHEETS.BOOKINGS:
      headers = [
        'booking_id', 'date', 'time_slot', 'duration', 'team_name',
        'players_count', 'contact_name', 'contact_phone', 'contact_email',
        'party_type', 'pitch_id', 'price', 'status', 'timestamp',
        'payment_status', 'special_requirements'
      ];
      break;
      
    case SHEETS.PITCHES:
      headers = [
        'pitch_id', 'name', 'capacity', 'hourly_rate', 'description', 'active_flag'
      ];
      // Add default pitches
      sheet.appendRow(headers);
      sheet.appendRow([1, 'Professional Turf Pitch', 22, 450, 'Premium natural turf pitch', true]);
      sheet.appendRow([2, 'Astro Turf Pitch', 22, 350, 'All-weather synthetic pitch', true]);
      sheet.appendRow([3, 'Training Nets Area', 12, 200, 'Dedicated nets facility', true]);
      return;
      
    case SHEETS.TIME_SLOTS:
      headers = ['slot_label', 'start_time', 'end_time', 'availability'];
      break;
      
    case SHEETS.SETTINGS:
      headers = ['setting_key', 'setting_value'];
      sheet.appendRow(headers);
      sheet.appendRow(['arena_name', 'Cricket Arena South Africa']);
      sheet.appendRow(['vat_rate', '0.15']);
      sheet.appendRow(['booking_window_days', '60']);
      sheet.appendRow(['max_players_per_slot', '50']);
      return;
      
    case SHEETS.TRANSACTIONS:
      headers = [
        'transaction_id', 'booking_id', 'payfast_transaction_id',
        'amount', 'status', 'timestamp', 'payment_data'
      ];
      break;
  }
  
  if (headers.length > 0) {
    sheet.appendRow(headers);
  }
}

/**
 * Get all pitches
 */
function getPitches() {
  const sheet = getSheet(SHEETS.PITCHES);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return {
      success: true,
      pitches: []
    };
  }
  
  const pitches = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[5]) { // active_flag
      pitches.push({
        pitch_id: row[0],
        name: row[1],
        capacity: row[2],
        hourly_rate: row[3],
        description: row[4],
        active_flag: row[5]
      });
    }
  }
  
  return {
    success: true,
    pitches: pitches
  };
}

/**
 * Get all time slots
 */
function getTimeSlots() {
  const sheet = getSheet(SHEETS.TIME_SLOTS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return {
      success: true,
      slots: []
    };
  }
  
  const slots = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    slots.push({
      label: row[0],
      start_time: row[1],
      end_time: row[2],
      availability: row[3]
    });
  }
  
  return {
    success: true,
    slots: slots
  };
}

/**
 * Check availability for a booking
 */
function checkAvailability(params) {
  const { date, timeSlot, duration, pitchId } = params;
  
  const bookingsSheet = getSheet(SHEETS.BOOKINGS);
  const data = bookingsSheet.getDataRange().getValues();
  
  // Check for conflicts
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const bookingDate = row[1];
    const bookingTimeSlot = row[2];
    const bookingDuration = row[3];
    const bookingPitchId = row[10];
    const bookingStatus = row[12];
    
    // Skip cancelled bookings
    if (bookingStatus === 'cancelled') continue;
    
    // Check if same date and pitch
    if (bookingDate === date && bookingPitchId === pitchId) {
      // Check time overlap
      // This is a simplified check - in production, you'd want more robust time conflict detection
      if (bookingTimeSlot === timeSlot) {
        return {
          success: true,
          available: false,
          message: 'This time slot is already booked. Please select a different time.'
        };
      }
    }
  }
  
  return {
    success: true,
    available: true,
    message: 'The pitch is available for the selected time!'
  };
}

/**
 * Create a new booking
 */
function createBooking(params) {
  try {
    // Check availability first
    const availabilityCheck = checkAvailability({
      date: params.date,
      timeSlot: params.timeSlot.label,
      duration: params.duration,
      pitchId: params.pitchId
    });
    
    if (!availabilityCheck.available) {
      return {
        success: false,
        message: availabilityCheck.message
      };
    }
    
    // Generate booking ID
    const bookingId = generateBookingId();
    
    // Add booking to sheet
    const bookingsSheet = getSheet(SHEETS.BOOKINGS);
    const timestamp = new Date().toISOString();
    
    bookingsSheet.appendRow([
      bookingId,
      params.date,
      params.timeSlot.label,
      params.duration,
      params.teamName,
      params.playersCount,
      params.contactName,
      params.contactPhone,
      params.contactEmail,
      params.partyType,
      params.pitchId,
      params.total,
      'pending', // status
      timestamp,
      'pending', // payment_status
      params.specialRequirements || ''
    ]);
    
    // Send notification to Google Chat (if configured)
    sendChatNotification('new_booking', {
      bookingId: bookingId,
      teamName: params.teamName,
      date: params.date,
      timeSlot: params.timeSlot.label,
      total: params.total
    });
    
    return {
      success: true,
      bookingId: bookingId,
      message: 'Booking created successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error creating booking: ' + error.toString()
    };
  }
}

/**
 * Generate unique booking ID
 */
function generateBookingId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `BK${timestamp}${random}`;
}

/**
 * Handle PayFast IPN notification
 */
function handlePayFastNotification(e) {
  try {
    const params = e.parameter;
    
    // Log the transaction
    const transactionsSheet = getSheet(SHEETS.TRANSACTIONS);
    const timestamp = new Date().toISOString();
    
    transactionsSheet.appendRow([
      params.pf_payment_id || '',
      params.m_payment_id || params.custom_str1 || '',
      params.pf_payment_id || '',
      params.amount_gross || '',
      params.payment_status || '',
      timestamp,
      JSON.stringify(params)
    ]);
    
    // Update booking status if payment is complete
    if (params.payment_status === 'COMPLETE') {
      const bookingId = params.m_payment_id || params.custom_str1;
      updateBookingPaymentStatus(bookingId, 'paid');
      
      // Send confirmation notification
      sendChatNotification('payment_confirmed', {
        bookingId: bookingId,
        amount: params.amount_gross
      });
    }
    
    return ContentService.createTextOutput('OK');
  } catch (error) {
    Logger.log('PayFast notification error: ' + error.toString());
    return ContentService.createTextOutput('ERROR');
  }
}

/**
 * Update booking payment status
 */
function updateBookingPaymentStatus(bookingId, status) {
  const bookingsSheet = getSheet(SHEETS.BOOKINGS);
  const data = bookingsSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bookingId) {
      bookingsSheet.getRange(i + 1, 15).setValue(status); // payment_status column
      bookingsSheet.getRange(i + 1, 13).setValue('confirmed'); // status column
      break;
    }
  }
}

/**
 * Send Google Chat notification
 */
function sendChatNotification(type, data) {
  if (!CONFIG.GOOGLE_CHAT_WEBHOOK || CONFIG.GOOGLE_CHAT_WEBHOOK === 'YOUR_GOOGLE_CHAT_WEBHOOK_URL') {
    return; // Skip if not configured
  }
  
  try {
    let message = '';
    
    switch(type) {
      case 'new_booking':
        message = `*New Booking Received*\n` +
                  `Booking ID: ${data.bookingId}\n` +
                  `Team: ${data.teamName}\n` +
                  `Date: ${data.date}\n` +
                  `Time: ${data.timeSlot}\n` +
                  `Total: R ${data.total.toFixed(2)}`;
        break;
        
      case 'payment_confirmed':
        message = `*Payment Confirmed*\n` +
                  `Booking ID: ${data.bookingId}\n` +
                  `Amount: R ${data.amount}`;
        break;
        
      default:
        message = 'Notification from Cricket Arena Booking System';
    }
    
    const payload = {
      text: message
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    UrlFetchApp.fetch(CONFIG.GOOGLE_CHAT_WEBHOOK, options);
  } catch (error) {
    Logger.log('Chat notification error: ' + error.toString());
  }
}

/**
 * Return JSON response
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Setup function - run this once to create all sheets
 */
function setupDatabase() {
  Object.values(SHEETS).forEach(sheetName => {
    getSheet(sheetName);
  });
  
  Logger.log('Database setup complete!');
}

/**
 * Test function for availability checking
 */
function testAvailability() {
  const result = checkAvailability({
    date: '2025-11-10',
    timeSlot: 0,
    duration: 2,
    pitchId: 1
  });
  
  Logger.log(result);
}

/**
 * Test function for creating a booking
 */
function testCreateBooking() {
  const result = createBooking({
    date: '2025-11-10',
    timeSlot: { label: '10:00 AM - 11:00 AM', start: '10:00', end: '11:00' },
    duration: 2,
    pitchId: 1,
    teamName: 'Test Team',
    playersCount: 11,
    contactName: 'John Doe',
    contactPhone: '0821234567',
    contactEmail: 'john@example.com',
    partyType: 'practice',
    subtotal: 900,
    vat: 135,
    total: 1035
  });
  
  Logger.log(result);
}
