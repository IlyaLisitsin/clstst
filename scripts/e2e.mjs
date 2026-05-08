import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';

const PORT = 4173;
const TIMEOUT_MS = 15000;
const POLL_INTERVAL_MS = 200;

function log(msg) {
  console.log(`[e2e] ${msg}`);
}

function waitForPort(port, timeout) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout;
    let attempt = 0;

    function tryConnect() {
      attempt += 1;
      const remaining = Math.max(0, deadline - Date.now());
      log(`waiting for port ${port} (attempt ${attempt}, ${remaining}ms left)`);

      const socket = createConnection(port, '127.0.0.1');
      socket.on('connect', () => {
        socket.destroy();
        log(`port ${port} is up after ${attempt} attempt(s)`);
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() < deadline) {
          setTimeout(tryConnect, POLL_INTERVAL_MS);
        } else {
          reject(new Error(`port ${port} not ready after ${timeout}ms`));
        }
      });
    }

    tryConnect();
  });
}

const open = process.argv.includes('--open');
const mode = open ? 'open' : 'run';

log(`mode: cypress ${mode}`);
log('starting vite preview server…');

const server = spawn('npx', ['vite', 'preview'], { stdio: 'inherit' });

server.on('error', (err) => {
  log(`failed to start preview server: ${err.message}`);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== null && code !== 0) log(`preview server exited unexpectedly (code ${code})`);
});

try {
  await waitForPort(PORT, TIMEOUT_MS);
} catch (err) {
  log(err.message);
  server.kill();
  process.exit(1);
}

log(`launching cypress ${mode}…`);
const cypress = spawn('npx', ['cypress', mode], { stdio: 'inherit' });

cypress.on('exit', (code) => {
  log(`cypress finished with exit code ${code ?? 0}`);
  log('shutting down preview server');
  server.kill();
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  log('received SIGINT, cleaning up');
  cypress.kill();
  server.kill();
  process.exit(130);
});
