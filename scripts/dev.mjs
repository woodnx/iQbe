import { spawn } from 'child_process';

spawn('npm', [ 'run', 'watch', '-w', 'packages/frontend' ], { stdio: 'inherit' });
spawn('npm', [ 'run', 'watch', '-w', 'packages/backend' ], { stdio: 'inherit' });