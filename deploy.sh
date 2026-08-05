#!/bin/bash
# 🏥 Prashanth Hospital Master Data Governance & Sanitization Platform
# Automated One-Click Deployment Script

echo "=========================================================================="
echo "🏥 Deploying Prashanth Hospital Master Data Governance Platform"
echo "=========================================================================="

# 1. Install Backend Dependencies & Start Server
echo "📦 Installing Backend Dependencies..."
cd backend
npm install --production
cd ..

# 2. Install Frontend Dependencies & Build Production Bundle
echo "🎨 Installing Frontend Dependencies & Building Assets..."
cd frontend
npm install
npm run build
cd ..

# 3. Start Application with PM2
echo "🚀 Launching Services with PM2..."
pm2 start backend/src/server.js --name mdg-backend
pm2 start "npm run preview -- --host 0.0.0.0 --port 3001" --cwd frontend --name mdg-frontend
pm2 save

echo "=========================================================================="
echo "✅ Deployment Successful!"
echo "🌐 Frontend Access: http://<server-ip>:3001"
echo "📡 Backend API:     http://<server-ip>:5050"
echo "=========================================================================="
