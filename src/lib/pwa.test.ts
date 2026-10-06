import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(process.cwd());

test('PWA manifest declares AuraCycle standalone app contract', () => {
  const manifest = JSON.parse(
    readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'),
  );

  assert.equal(manifest.name, 'AuraCycle — Private Cycle Tracker');
  assert.equal(manifest.short_name, 'AuraCycle');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'portrait');
  assert.equal(manifest.icons[0].src, '/icon.svg');
});

test('production entry registers the local service worker only on the web runtime', () => {
  const source = readFileSync(resolve(root, 'src/main.tsx'), 'utf8');

  assert.match(source, /navigator\.serviceWorker\.register\('\/sw\.js'\)/);
  assert.match(source, /import\.meta\.env\.PROD/);
  assert.match(source, /!Capacitor\.isNativePlatform\(\)/);
});

test('service worker does not intercept non-GET or cross-origin requests', () => {
  const source = readFileSync(resolve(root, 'public/sw.js'), 'utf8');

  assert.match(source, /request\.method !== 'GET'/);
  assert.match(source, /new URL\(request\.url\)\.origin !== self\.location\.origin/);
});

test('service worker provides an offline navigation fallback to the app shell', () => {
  const source = readFileSync(resolve(root, 'public/sw.js'), 'utf8');

  assert.match(source, /request\.mode === 'navigate'/);
  assert.match(source, /caches\.match\('\/'\)/);
});
