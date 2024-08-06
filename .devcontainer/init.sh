#!/bin/bash

set -xe

sudo apt-get update -y && sudo apt-get upgrade -y
sudo chown -R node /iQbe
sudo npm install -g env-cmd

cp -f .devcontainer/dev.env .env
cp -f .devcontainer/allowed-server.dev.json packages/backend/src/allowed-server.json

echo -n "JWT_SECRET_KEY=" >> .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'));" >> .env

npm install
npm run api
npm run migrate:exe
