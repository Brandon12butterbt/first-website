const express = require('express');
const cors = require('cors');

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

app.listen(PORT, () => {
  console.log(`Env API running on http://localhost:${PORT}`);
});
