# AFluxGen Web App

This is a personal full-stack web application project built using **Angular** for the frontend and **Node.js (Express)** for the backend API. It is hosted on an **AWS EC2 instance** with static files served through **Nginx** and protected and cached via **AWS CloudFront**. Domain resolution is managed through **Route 53**.

## 🚀 Deployment Overview

1. Github pipeline executes (.github/workflows/ci.yml)
2. My Personal Desktop (running github runner as a service) executes the pipeline
3. Pipeline will stop if any Unit Tests fail
4. Applications are built on my personal desktop and copied to the appropriate locations on the EC2 instance
5. Express API is restarted

## 🗺 Architecture Diagram

_See below for a visual representation of the deployment architecture._
![diagram](/readme-assets/diagram.excalidraw.png)