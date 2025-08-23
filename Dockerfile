FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve to serve the build
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Serve the build. "serve" binds to 0.0.0.0 by default; we just specify the port.
# Use a shell form so $PORT provided by Railway is expanded at runtime (fallback 3000 locally).
CMD ["sh", "-c", "serve -s build -l tcp://0.0.0.0:${PORT:-3000}"]
