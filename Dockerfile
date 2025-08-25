FROM node:20-alpine

WORKDIR /app

# Accept build arguments from Railway
ARG REACT_APP_API_URL
ARG REACT_APP_SANCTUM_URL
ARG REACT_APP_ENABLE_WEBSOCKET
ARG REACT_APP_WS_URL

# Set environment variables for the build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SANCTUM_URL=$REACT_APP_SANCTUM_URL
ENV REACT_APP_ENABLE_WEBSOCKET=$REACT_APP_ENABLE_WEBSOCKET
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the app with environment variables
RUN npm run build

# Install serve to serve the build
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Serve the build. "serve" binds to 0.0.0.0 by default; we just specify the port.
# Use a shell form so $PORT provided by Railway is expanded at runtime (fallback 3000 locally).
CMD ["sh", "-c", "serve -s build -l tcp://0.0.0.0:${PORT:-3000}"]
