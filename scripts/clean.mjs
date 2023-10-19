import fs from 'fs';

fs.rmSync(__dirname + '/../packages/backend/dist', { recursive: true, force: true })
fs.rmSync(__dirname + '/../packages/frontend/dist', { recursive: true, force: true })
fs.rmSync(__dirname + '/../packages/frontend/dev-dist', { recursive: true, force: true })