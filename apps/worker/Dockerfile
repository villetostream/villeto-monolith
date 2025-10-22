# Use the official Node.js image as the base image
FROM node:22-bullseye-slim AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# install ps (procps) so watcher tools that spawn `ps` work
RUN apt-get update \
 && apt-get install -y --no-install-recommends procps \
 && rm -rf /var/lib/apt/lists/*

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
RUN pnpm run build worker

FROM node:22-bullseye-slim AS prod

# Set the working directory inside the container
WORKDIR /usr/src/app

# install pmpm as the package manager
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Copy the app build from the build stage
COPY --from=builder /usr/src/app ./

# Expose the application port
EXPOSE 3001

# Command to run the application
CMD ["node", "./dist/apps/worker/main"]