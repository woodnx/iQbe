import { execSync, spawnSync } from 'child_process';
import fs from 'fs';

try {
  // build frontend
  spawnSync('npm', [ 'run', 'build', '-w', 'packages/frontend' ], { stdio: 'inherit' });

  // build backend
  spawnSync('npm', [ 'run', 'build', '-w', 'packages/backend' ], { stdio: 'inherit' });

  // check existing directory 
  if (!fs.existsSync('./packages/backend/dist/web')) {
    execSync("mkdir ./packages/backend/dist/web")
  }

  // copy build frontend file
  execSync("cp -f -r ./packages/frontend/dist/* ./packages/backend/dist/web")
} catch {

}
