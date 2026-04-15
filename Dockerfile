# Frontend Build Stage
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY public ./public
COPY src ./src

# Build React app
RUN npm run build

# Backend Stage with Frontend
FROM node:18-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install backend dependencies
RUN cd server && npm install --omit=dev

# Copy backend source
COPY server ./server
COPY config ./config
COPY controllers ./controllers
COPY routes ./routes
COPY middleware ./middleware
COPY models ./models

# Copy built frontend from build stage
COPY --from=frontend-build /app/build ./build

# Expose ports
EXPOSE 5000 3000

# Set environment
ENV NODE_ENV=production

# Start backend (it will serve the build folder)
CMD ["node", "server/server.js"]
