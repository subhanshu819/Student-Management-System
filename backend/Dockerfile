# Multi-stage production build for Node.js Express API
# ── Stage 1: Build & Dependencies ──
FROM node:20-alpine AS dependencies

WORKDIR /app

# Install dependency definitions
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: Minimal Production Runtime ──
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Security: run as non-root node user
USER node

# Copy dependencies and application source
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src/ ./src/

# Expose backend port
EXPOSE 5000

# Docker native healthcheck using built-in Node fetch
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the application server
CMD ["node", "src/server.js"]
