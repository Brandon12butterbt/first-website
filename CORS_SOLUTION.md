# Fixing CORS Issues with the Flux API

The Flux AI API, like many external APIs, doesn't allow direct browser requests due to CORS (Cross-Origin Resource Sharing) restrictions. There are several ways to solve this:

## Option 1: Use a browser extension to bypass CORS (for development only)

1. Install a CORS bypass extension in your browser:
   - Chrome: [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino)
   - Firefox: [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)

2. Enable the extension when testing the application

This approach is **only recommended for development purposes**. It's not suitable for production.

## Option 2: Create a backend proxy (recommended for production)

1. Create a simple backend server that forwards requests to the Flux API
2. Add your API key on the server side
3. Make requests to your own server instead of directly to Flux

This is the approach we implemented with server.js, but it requires additional setup.

## Option 3: Use a serverless function

1. Create a serverless function on platforms like Vercel, Netlify, or AWS Lambda
2. Handle the API requests and add your API key there
3. Call your serverless function endpoint from your application

This is a good production-ready solution that doesn't require maintaining a separate server.

## Current Implementation

We're currently using a direct API call approach with a fallback to a placeholder image when the API call fails due to CORS:

```typescript
generateImage(prompt: string, negativePrompt: string = ''): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`
  });
  
  const body = { prompt, negative_prompt: negativePrompt };
  
  return this.http.post(this.apiUrl, body, { headers }).pipe(
    catchError(error => {
      console.error('Error calling Flux API:', error);
      
      // Fallback to placeholder image
      return of({
        images: [{
          url: 'https://via.placeholder.com/1024x1024/text=Generated+Image',
          id: 'placeholder'
        }]
      });
    })
  );
}
```

To make this work, use one of the options above to bypass or solve the CORS issue. 