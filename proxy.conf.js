const { environment } = require('./src/environments/environment');

module.exports = {
  "/api/flux": {
    target: "https://api.flux.ai",
    secure: true,
    changeOrigin: true,
    pathRewrite: {
      "^/api/flux": "/v1"
    },
    logLevel: "debug",
    onProxyReq: function(proxyReq, req, res) {
      // Try to get API key from environment
      let apiKey = '';
      try {
        // Access the API key from the imported environment
        apiKey = environment.flux.apiKey;
      } catch (error) {
        // Fallback to hardcoded API key from Angular environment
        apiKey = 'd7b16878b8874908b215b0bde51c3ad4';
        console.log('Using fallback API key');
      }
      
      // Set the authorization header with the API key
      proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
      console.log('Added Authorization header to proxy request');
    }
  }
}; 