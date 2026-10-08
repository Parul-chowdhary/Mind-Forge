FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy application manifests
COPY package*.json ./

# Copy all application assets and modules
COPY . .

# MindForge uses zero external runtime dependencies
# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Production entry point
CMD ["node", "server.js"]
