const express = require('express');
const cors = require('cors');
// const fetch = require('node-fetch'); // npm install node-fetch
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Allow CORS for Angular app
app.use(cors({
  origin: [
    'http://afluxgen.com',
    'https://afluxgen.com',
    'http://www.afluxgen.com',
    'https://www.afluxgen.com',
    'http://localhost',
    'http://localhost:4200'
  ]
  // origin: 'http://localhost:4200',
}));

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

app.use(express.json());

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
      const errorText = await response.text();  // Get error text (if any)
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
