#!/bin/bash

set -xe

sudo apt-get update -y && sudo apt-get upgrade -y
sudo chown -R node /iQbe
sudo npm install -g env-cmd

cp -f .devcontainer/dev.env .env
npm install
npm run migrate:exe
