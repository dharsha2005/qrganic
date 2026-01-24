# Render Static Site Configuration

## Build Settings
- Build Command: npm run build
- Publish Directory: dist
- Node Version: 18

## Environment Variables
- VITE_API_URL: https://qrganic-backend.onrender.com

## Routing Fix
The _redirects file in public/ folder handles client-side routing
All requests fall back to index.html for React Router

## Deployment Steps
1. Push to GitHub
2. Create Static Site on Render
3. Connect repository
4. Set root directory to frontend
5. Configure build settings
6. Deploy
