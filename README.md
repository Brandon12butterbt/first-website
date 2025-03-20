# FluxGen - AI Image Generator

FluxGen is a web application that allows users to generate AI images using the Flux AI API. It's built with Angular, Tailwind CSS, Supabase, and Stripe.

## Features

- User authentication (signup, login, password reset) via Supabase
- AI image generation using Flux AI
- Credit system for image generation
- Stripe integration for purchasing credits
- Dashboard to view generated images
- Responsive design with Tailwind CSS and Angular Material

## Technologies Used

- **Frontend:** Angular, Tailwind CSS, Angular Material
- **Backend:** Supabase (Authentication, Database)
- **Payments:** Stripe
- **AI Image Generation:** Flux AI

## Development Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/fluxgen.git
   cd fluxgen
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Create a Supabase account and project
   - Set up Stripe account
   - Get API key for Flux AI
   - Create environment files with your API keys

4. Run the development server
   ```
   ng serve
   ```

5. Navigate to `http://localhost:4200/`

## Database Schema

The application uses two main tables in Supabase:

1. **profiles** - Stores user profile information including credit balance
2. **generated_images** - Stores all generated images with metadata

## Payment System

The application uses Stripe for processing payments. Users can purchase different credit packages:

- Basic: 10 credits for $4.99
- Standard: 50 credits for $19.99
- Premium: 120 credits for $39.99

Each image generation costs 1 credit.

## Image Generation

The application uses Flux AI API for image generation. Users can:

- Enter text prompts
- Add negative prompts
- Adjust image dimensions
- Save and download generated images

## License

This project is licensed under the MIT License - see the LICENSE file for details.
