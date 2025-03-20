const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// CORS middleware
app.use(cors());

// Flux API key (get from environment in production)
const FLUX_API_KEY = 'd7b16878b8874908b215b0bde51c3ad4';

// Proxy middleware for Flux API
const fluxProxy = createProxyMiddleware({
  target: 'https://api.flux.ai',
  changeOrigin: true,
  pathRewrite: {
    '^/api/flux': '/v1'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Remove any existing authorization header
    proxyReq.removeHeader('Authorization');
    
    // Add API key to all requests with proper format
    proxyReq.setHeader('Authorization', `Bearer ${FLUX_API_KEY}`);
    
    // Log the Authorization header for debugging
    console.log('Authorization header:', `Bearer ${FLUX_API_KEY.substring(0, 5)}...`);
    
    // Log request path
    console.log('Proxying request to:', req.method, req.path);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Proxy response status:', proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error: ' + err.message);
  }
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.send('Proxy server is running');
});

// Use the proxy for flux API requests
app.use('/api/flux', fluxProxy);

// Start the server
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
}); 