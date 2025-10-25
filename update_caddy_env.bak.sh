#!/bin/bash

# Read the active environment
ACTIVE_ENV=$(cat /opt/active_env)

# Determine the inactive environment
if [ "$ACTIVE_ENV" = "blue" ]; then
  INACTIVE_ENV="green"
else
  INACTIVE_ENV="blue"
fi

# Set the environment variables
export UPSTREAM_API_GATEWAY="api-gateway-$INACTIVE_ENV"
export UPSTREAM_WORKER="worker-$INACTIVE_ENV"

# Remove existing containers with the same name
docker rm -f "worker-$INACTIVE_ENV"
docker rm -f "api-gateway-$INACTIVE_ENV"

# wait a few seconds for the removal
sleep 30

# Restart Caddy with the new environment variables
docker compose -f /opt/$INACTIVE_ENV/prod-docker-compose.yaml up -d --force-recreate caddy
