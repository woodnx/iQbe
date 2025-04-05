#!/bin/bash

set -xe

sudo apt-get update -y && sudo apt-get upgrade -y
sudo chown -R node /iQbe

cp -f .devcontainer/dev.env .config/.env
cp -f .devcontainer/allowed-server.dev.json packages/backend/src/allowed-server.json

echo -n "JWT_SECRET_KEY=" >> ./.config/.env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'));" >> ./.config/.env

npm install
npm run api
npm run migrate:exe
