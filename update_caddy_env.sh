#!/usr/bin/env bash

# /opt/update_caddy_env.sh
# Atomically update the running Caddy's Caddyfile to point to the currently active env,
# validate the config, reload Caddy, and rollback on failure.

set -euo pipefail

LOG_PREFIX="[update_caddy_env]"

timestamp() { date --utc +"%Y-%m-%dT%H:%M:%SZ"; }

echo "$timestamp $LOG_PREFIX starting"

# Determine active env
if [ ! -f /opt/active_env ]; then
  echo "$timestamp $LOG_PREFIX ERROR: /opt/active_env not found" >&2
  exit 2
fi
ACTIVE_ENV="$(cat /opt/active_env)"
echo "$timestamp $LOG_PREFIX active env: $ACTIVE_ENV"

SRC_CADDYFILE="/opt/${ACTIVE_ENV}/conf/Caddyfile"
if [ ! -f "$SRC_CADDYFILE" ]; then
  echo "$timestamp $LOG_PREFIX ERROR: source caddyfile missing: $SRC_CADDYFILE" >&2
  exit 3
fi

# Try to detect where the caddy container mounts /etc/caddy on the host
CADDY_CONTAINER_NAME="caddy"
CADDY_MOUNT_SRC="$(docker inspect --format '{{range .Mounts}}{{if eq .Destination "/etc/caddy"}}{{.Source}}{{end}}{{end}}' "${CADDY_CONTAINER_NAME}" 2>/dev/null || true)"

# Default fallback if not found
if [ -z "$CADDY_MOUNT_SRC" ]; then
  # create a central directory if needed
  CADDY_MOUNT_SRC="/opt/caddy/conf"
  mkdir -p "$CADDY_MOUNT_SRC"
  echo "$timestamp $LOG_PREFIX info: could not detect /etc/caddy mount; falling back to $CADDY_MOUNT_SRC"
fi

if [ ! -d "$CADDY_MOUNT_SRC" ]; then
  echo "$timestamp $LOG_PREFIX ERROR: caddy mount src does not exist: $CADDY_MOUNT_SRC" >&2
  exit 4
fi

DST_CADDYFILE="${CADDY_MOUNT_SRC}/Caddyfile"

# Backup current Caddyfile (if present)
if [ -f "$DST_CADDYFILE" ]; then
  BACKUP="${DST_CADDYFILE}.backup.$(date +%s)"
  cp "$DST_CADDYFILE" "$BACKUP"
  echo "$timestamp $LOG_PREFIX backed up existing Caddyfile to $BACKUP"
fi

# Copy atomically: write to temp then mv
TMP="$(mktemp "${DST_CADDYFILE}.tmp.XXXX")"
cp "$SRC_CADDYFILE" "$TMP"
chmod 644 "$TMP"
mv -f "$TMP" "$DST_CADDYFILE"
sync
echo "$timestamp $LOG_PREFIX wrote new Caddyfile to $DST_CADDYFILE"

# Validate and reload
set +e
docker exec "${CADDY_CONTAINER_NAME}" caddy validate --config /etc/caddy/Caddyfile
VALID_EXIT=$?
set -e

if [ "$VALID_EXIT" -ne 0 ]; then
  echo "$timestamp $LOG_PREFIX ERROR: validation failed (exit $VALID_EXIT). Restoring backup and aborting." >&2
  # rollback if backup exists
  if [ -f "${BACKUP:-}" ]; then
    mv -f "${BACKUP}" "$DST_CADDYFILE"
    docker exec "${CADDY_CONTAINER_NAME}" caddy validate --config /etc/caddy/Caddyfile || true
    echo "$timestamp $LOG_PREFIX rolled back to backup"
  fi
  exit 5
fi

# Reload the config
set +e
docker exec "${CADDY_CONTAINER_NAME}" caddy reload --config /etc/caddy/Caddyfile
RELOAD_EXIT=$?
set -e

if [ "$RELOAD_EXIT" -ne 0 ]; then
  echo "$timestamp $LOG_PREFIX ERROR: reload failed (exit $RELOAD_EXIT). Restoring backup and aborting." >&2
  if [ -f "${BACKUP:-}" ]; then
    mv -f "${BACKUP}" "$DST_CADDYFILE"
    docker exec "${CADDY_CONTAINER_NAME}" caddy validate --config /etc/caddy/Caddyfile || true
    docker exec "${CADDY_CONTAINER_NAME}" caddy reload --config /etc/caddy/Caddyfile || true
    echo "$timestamp $LOG_PREFIX rolled back to backup after reload failure"
  fi
  exit 6
fi

# success: remove the backup (optional retention policy)
if [ -f "${BACKUP:-}" ]; then
  # keep 3 most recent backups; remove older backups (optional)
  ls -1t "${DST_CADDYFILE}.backup."* 2>/dev/null | sed -e '1,3d' | xargs -r rm -f || true
fi

echo "$timestamp $LOG_PREFIX successfully applied and reloaded config"
exit 0
