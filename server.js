const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Validation middleware
const validateTwilioConfig = (req, res, next) => {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    return res.status(500).json({
      success: false,
      error: 'Twilio configuration is missing. Please check your environment variables.'
    });
  }
  next();
};

// Route to send SMS to a single user
app.post('/send-sms', validateTwilioConfig, async (req, res) => {
  try {
    const { to, message } = req.body;

    // Validate input
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Both "to" and "message" fields are required'
      });
    }

    // Send SMS
    const messageInstance = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    res.json({
      success: true,
      messageId: messageInstance.sid,
      status: messageInstance.status,
      to: messageInstance.to,
      message: 'SMS sent successfully'
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send SMS'
    });
  }
});

// Route to send SMS to multiple users (bulk SMS)
app.post('/send-bulk-sms', validateTwilioConfig, async (req, res) => {
  try {
    const { recipients, message } = req.body;

    // Validate input
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Recipients array is required and must not be empty'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message field is required'
      });
    }

    const results = [];
    const errors = [];

    // Send SMS to each recipient
    for (const phoneNumber of recipients) {
      try {
        const messageInstance = await client.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: phoneNumber
        });

        results.push({
          to: phoneNumber,
          messageId: messageInstance.sid,
          status: messageInstance.status,
          success: true
        });
      } catch (error) {
        errors.push({
          to: phoneNumber,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      success: true,
      totalSent: results.length,
      totalFailed: errors.length,
      results: results,
      errors: errors
    });

  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send bulk SMS'
    });
  }
});

// Route to check message status
app.get('/message-status/:messageId', validateTwilioConfig, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await client.messages(messageId).fetch();

    res.json({
      success: true,
      messageId: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    });

  } catch (error) {
    console.error('Error fetching message status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch message status'
    });
  }
});

// Route to get account information
app.get('/account-info', validateTwilioConfig, async (req, res) => {
  try {
    const account = await client.api.accounts(accountSid).fetch();

    res.json({
      success: true,
      accountSid: account.sid,
      friendlyName: account.friendlyName,
      status: account.status,
      type: account.type
    });

  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch account information'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Twilio SMS Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(port, () => {
  console.log(`Twilio SMS Backend running on port ${port}`);
  console.log('Available endpoints:');
  console.log('- POST /send-sms - Send SMS to single user');
  console.log('- POST /send-bulk-sms - Send SMS to multiple users');
  console.log('- GET /message-status/:messageId - Check message status');
  console.log('- GET /account-info - Get Twilio account information');
  console.log('- GET /health - Health check');
});