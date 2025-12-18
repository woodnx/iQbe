#!/bin/sh
set -e

ENV_FILE="/iQbe/.config/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "[entrypoint] .env not found, generating JWT_SECRET_KEY"
  mkdir -p /iQbe/.config
  echo "JWT_SECRET_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" \
    > "$ENV_FILE"
else
  echo "[entrypoint] .env exists, reuse it"
fi

exec "$@"