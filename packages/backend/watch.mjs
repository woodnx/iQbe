import { spawn, spawnSync } from 'child_process';

spawnSync('tsc-alias', [ '-p', 'tsconfig.json']);
const mainProc = spawn('node', [ '--enable-source-maps', './dist/index.js' ]);

mainProc.stdout.on('data', (data) => {
  process.stdout.write(data);
});

mainProc.stderr.on('data', data => {
  process.stderr.write(data);
});