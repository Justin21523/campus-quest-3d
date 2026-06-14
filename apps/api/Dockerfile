# apps/api/Dockerfile
# Multi-stage build for production API server

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/*/package*.json ./packages/

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Build TypeScript
RUN npm run build --workspace=apps/api

# Stage 2: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files for production install
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install production dependencies only
RUN npm ci --omit=dev --workspace=apps/api --include-workspace-root

# Copy built artifacts from builder
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages

# Copy runtime config
COPY apps/api/.env.example ./apps/api/.env

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

# Switch to non-root user
USER nodejs

# Start server
CMD ["node", "apps/api/dist/server.js"]