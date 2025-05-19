const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

app.use(express.json());

// Allow CORS
app.use(cors({
  origin: [
    'http://afluxgen.com',
    'https://afluxgen.com',
    'http://www.afluxgen.com',
    'https://www.afluxgen.com',
    'http://localhost',
    'http://localhost:4200'
  ]
}));

//Supabase Setup for Account Deletion (Service Role Required)
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

const supabase = createClient(supabaseUrl, serviceRoleKey, {  auth: {    autoRefreshToken: false,    persistSession: false  }});

app.delete('/admin/delete-user/:id', async (req, res) => {
  const userId = req.params.id;

  const { data, error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
});

//Email Support Call
app.post('/contact', async (req, res) => {
  const { type, description, email } = req.body;

  if (!type || !description || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SUPPORT,
        pass: process.env.EMAIL_SUPPORT_PASS
      }
    });

    const mailOptions = {
      from: `"Afluxgen Contact Form" <${process.env.EMAIL_SUPPORT}>`,
      to: 'afluxgen.help@gmail.com',
      subject: `Contact Request: ${type}`,
      text: `Email: ${email}\n\nDescription:\n${description}`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});


//all env variables
app.get('/env', (req, res) => {
  res.json({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    FLUX_API_KEY: process.env.FLUX_API_KEY,
    STRIPE_STANDARD_URL: process.env.STRIPE_STANDARD_URL,
    STRIPE_PUB_KEY: process.env.STRIPE_PUB_KEY,
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
    STRIPE_BASIC_URL: process.env.STRIPE_BASIC_URL,
    FLUX_ACCOUNT_ID: process.env.FLUX_ACCOUNT_ID,
    STRIPE_PREMIUM_URL: process.env.STRIPE_PREMIUM_URL,
    TURN_WIDGET_SITE_KEY: process.env.TURN_WIDGET_SITE_KEY
  });
});

// CloudFlare worker Call for text-to-image generation
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body' });
  }

  try {
    const origin = 'http://localhost:4200';

    const response = await fetch(process.env.FLUX_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUX_API_KEY}`,
        'Content-Type': 'application/json',
        'Origin': origin
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from external API:', errorText);
      return res.status(500).json({ error: 'Failed to generate image', message: errorText });
    }

    // Proceed with the image data handling
    const arrayBuffer = await response.arrayBuffer();
    const blob = Buffer.from(arrayBuffer);

    // Set correct content type
    const contentType = response.headers.get('content-type') || 'image/png';
    res.set('Content-Type', contentType);
    console.log('content-type: ', contentType);
    res.send(blob);

  } catch (error) {
    console.error('Error calling external API:', error);
    const fallback = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set('Content-Type', 'image/gif');
    res.send(fallback);
  }
  
});

app.listen(PORT, () => {
  console.log(`Env API running on http://localhost:${PORT}`);
});

module.exports = app;