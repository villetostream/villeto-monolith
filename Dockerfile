# Use the official Node.js image as the base image
FROM node:22-bullseye-slim AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json or pnpm-lock.yaml to the working directory
COPY package*.json ./
COPY pnpm-lock.yaml ./

# install pmpm as the package manager
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
# Install the application dependencies
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN pnpm run build

FROM node:22-bullseye-slim AS runner

# Copy the app build from the build stage
COPY --from=builder /app ./

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "./dist/main"]