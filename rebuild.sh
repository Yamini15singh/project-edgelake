#!/bin/bash

echo "[🛠️] Pulling latest code from GitHub..."
cd /Users/yaminisingh/project_edgelake || exit 1
git pull origin main || exit 1

echo "[🔄] Restarting EdgeLake services..."

# Kill existing Node and React processes
pkill -f "node server.js"
pkill -f "react-scripts start"

# Restart Node API
cd edgelake_api
nohup node server.js > ../api.log 2>&1 &

# Restart React app
cd ../edgelake_client
nohup npm start > ../client.log 2>&1 &

echo "[✅] Deployment complete"
echo "[🕐] $(date): Deploy triggered" >> deploy.log

