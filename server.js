require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 2. The Endpoint SMS Forwarder hits
app.get('/api/sms', async (req, res) => {
  // SMS Forwarder sends data in URL params
  const sender = req.query.sender || req.query.from || 'Unknown';
  const message = req.query.msg || req.query.message || 'Empty';

  console.log(`📩 Incoming SMS from: ${sender}`);
  console.log(`💬 Message: ${message}`);

  // 3. Save to Supabase
  const { data, error } = await supabase
    .from('sms_logs')
    .insert([
      { 
        sender: sender, 
        message: message, 
        received_at: new Date() 
      }
    ])
    .select();

  if (error) {
    console.error('❌ Supabase Insert Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }

  console.log('✅ SMS saved to Supabase!');
  res.json({ success: true, id: data[0].id });
});

// 4. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});