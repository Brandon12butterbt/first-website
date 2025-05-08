# AFluxGen Web App

This is a personal full-stack web application project built using **Angular** for the frontend and **Node.js (Express)** for the backend API.
I've used what I have learned throughout my education and professional career to embark on this web application journey.
I've had a blast working on this project, and cannot wait to start on the next adventure.

## 🚀 Deployment Overview

1. Github pipeline executes (.github/workflows/ci.yml)
2. My Personal Desktop (running github runner as a service) executes the pipeline
3. Pipeline will stop if any Unit Tests fail
4. Applications are built on my personal desktop and copied to the appropriate locations on the EC2 instance
5. Express API is restarted

## 🗺 Architecture Diagram


![diagram](/readme-assets/diagram.excalidraw.png)