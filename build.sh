#!/bin/bash
# TaskFlow Frontend Production Build

# 1. Install dependencies
npm ci

# 2. Build for production
npm run build

# 3. Install serve if not already installed
npm install -g serve

# 4. Start the server (for Railway deployment)
# Railway will use the CMD from Dockerfile or start command from railway.toml
echo "Build completed. Use 'npx serve -s build -p \$PORT' to serve."
