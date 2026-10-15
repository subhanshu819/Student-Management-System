# Multi-stage production build for React + Vite Frontend
# ── Stage 1: Build the Static Bundle ──
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy application code and build
COPY . .
RUN npm run build

# ── Stage 2: Serve via High-Performance Nginx ──
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with API reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Nginx container healthcheck (busybox wget: no --spider; use -O /dev/null)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 -O /dev/null http://127.0.0.1:80/health || exit 1

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
