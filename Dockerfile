FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve to serve the build
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Serve the build and bind to all interfaces so Railway can route to the container
# bind to 0.0.0.0:3000 instead of default localhost
CMD ["serve", "-s", "build", "-l", "0.0.0.0:3000"]
