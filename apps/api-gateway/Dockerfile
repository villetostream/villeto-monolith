# Use the official Node.js image as the base image
FROM node:22-bullseye-slim AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install necessary tools
RUN apt-get update \
    && apt-get install -y --no-install-recommends procps \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Enable and prepare pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Build each application in the monorepo
RUN pnpm run build:api-gateway

# Production stage
FROM node:22-bullseye-slim AS prod

# Set the working directory inside the container
WORKDIR /usr/src/app

# Enable and prepare pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Copy built files and production dependencies from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --prod
RUN npm i -g @nestjs/cli

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/apps/api-gateway/main"]