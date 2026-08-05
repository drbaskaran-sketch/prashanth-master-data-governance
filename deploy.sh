#!/bin/bash
# 🏥 Prashanth Hospital Master File Analyzer
# Automated Deployment Script

echo "=========================================================================="
echo "🏥 Deploying Prashanth Hospital Master File Analyzer Platform"
echo "=========================================================================="

# 1. Install Python Backend Dependencies
echo "📦 Installing Python Backend Dependencies..."
python3 -m pip install fastapi uvicorn pandas polars openpyxl xlsxwriter rapidfuzz python-multipart --break-system-packages

# 2. Install Frontend Dependencies & Build Assets
echo "🎨 Installing Frontend Dependencies & Building Assets..."
cd frontend
npm install
npm run build
cd ..

# 3. Start Application Services with PM2
echo "🚀 Launching Master File Analyzer Services..."
pm2 stop mdg-backend mdg-frontend 2>/dev/null || true
pm2 delete mdg-backend mdg-frontend 2>/dev/null || true

pm2 start "python3 main.py" --cwd backend --name mdg-backend
pm2 start "npm run preview -- --host 0.0.0.0 --port 3001" --cwd frontend --name mdg-frontend
pm2 save

echo "=========================================================================="
echo "✅ Deployment Successful!"
echo "🌐 Frontend Access: http://<server-ip>:3001"
echo "📡 Backend API:     http://<server-ip>:5050"
echo "=========================================================================="
