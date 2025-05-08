# AFluxGen Web App

This is a personal full-stack web application project built using **Angular** for the frontend and **Node.js (Express)** for the backend API.
I've used what I have learned throughout my education and professional career to embark on this web application journey.
I've had a blast working on this project, and cannot wait to start on the next adventure.

## Web Application Overview

The AFluxGen Web Application provides users the ability to turn text directly into images. These images can then be downloaded and/or saved to their personal gallery.
Users can manage their own account, manage their own image gallery, purchase additional tokens, and track all purchases.
This Web Application uses Supabase for authentication and database storage, Stripe for payment processing, and Stability AI for text-to-image generation.

## 🚀 Deployment Overview

1. Github pipeline executes (.github/workflows/ci.yml)
2. My Personal Desktop (running github runner as a service) executes the pipeline
3. Pipeline will stop if any Unit Tests fail
4. Applications are built on my personal desktop and copied to the appropriate locations on the EC2 instance
5. Express API is restarted

## 🗺 Architecture Diagram


![diagram](/readme-assets/diagram.excalidraw.png)