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

# Serve the build using Railway's preferred method
# Railway sets PORT environment variable automatically
CMD ["sh", "-c", "npx serve -s build -p ${PORT:-3000}"]
