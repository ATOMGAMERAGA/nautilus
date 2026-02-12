# Build stage
FROM node:20-slim AS builder

# Install build dependencies for mediasoup and prisma
RUN apt-get update && apt-get install -y 
    python3 
    make 
    gcc 
    g++ 
    openssl 
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for tsc)
RUN npm install

# Copy source and config
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:20-slim

# Install runtime dependencies
# mediasoup worker needs these libraries
RUN apt-get update && apt-get install -y 
    python3 
    make 
    gcc 
    g++ 
    openssl 
    ffmpeg 
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create uploads directory
RUN mkdir -p uploads

# Expose ports
EXPOSE 3000
# Mediasoup RTP ports
EXPOSE 10000-10100/udp

CMD ["npm", "start"]
