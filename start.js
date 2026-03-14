const { spawn } = require('child_process');

const port = process.env.PORT || 3000;

console.log(`Starting Next.js app on port ${port}...`);

const nextProcess = spawn('npx', ['next', 'start', '-p', port], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('error', (error) => {
  console.error('Failed to start Next.js:', error);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  nextProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  nextProcess.kill('SIGINT');
});
