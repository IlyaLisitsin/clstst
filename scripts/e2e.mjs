import { spawn } from 'node:child_process';
import http from 'node:http';

const URL_TO_CHECK = 'http://localhost:4173/freshcells-trial/';
const TIMEOUT_MS = 30000;
const POLL_INTERVAL_MS = 250;
const REQUEST_TIMEOUT_MS = 1500;

function log(msg) {
  console.log(`[e2e] ${msg}`);
}

function waitForUrl(url, timeout) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout;
    let attempt = 0;

    function tryOnce() {
      attempt += 1;
      const remaining = Math.max(0, deadline - Date.now());
      log(`probing ${url} (attempt ${attempt}, ${remaining}ms left)`);

      const req = http.get(url, (res) => {
        res.resume();
        const status = res.statusCode ?? 0;
        if (status > 0 && status < 500) {
          log(`got HTTP ${status} from ${url} after ${attempt} attempt(s)`);
          resolve();
        } else {
          log(`got HTTP ${status}, retrying`);
          retry();
        }
      });

      req.on('error', (err) => {
        log(`probe error: ${err.code ?? err.message}`);
        retry();
      });

      req.setTimeout(REQUEST_TIMEOUT_MS, () => {
        log('probe timed out');
        req.destroy();
        retry();
      });

      function retry() {
        if (Date.now() < deadline) setTimeout(tryOnce, POLL_INTERVAL_MS);
        else reject(new Error(`${url} did not respond within ${timeout}ms`));
      }
    }

    tryOnce();
  });
}

const open = process.argv.includes('--open');
const mode = open ? 'open' : 'run';

log(`mode: cypress ${mode}`);
log('starting vite preview server…');

const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1'], { stdio: 'inherit' });

server.on('error', (err) => {
  log(`failed to start preview server: ${err.message}`);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== null && code !== 0) log(`preview server exited unexpectedly (code ${code})`);
});

try {
  await waitForUrl(URL_TO_CHECK, TIMEOUT_MS);
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
