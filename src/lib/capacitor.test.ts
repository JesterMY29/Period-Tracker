import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(process.cwd());

test('Capacitor configuration targets the production Vite output', () => {
  const config = JSON.parse(
    readFileSync(resolve(root, 'capacitor.config.json'), 'utf8'),
  );

  assert.equal(config.appId, 'com.auracycle.app');
  assert.equal(config.appName, 'AuraCycle');
  assert.equal(config.webDir, 'dist');
});

test('Capacitor packaging stays dependency-minimal', () => {
  const packageJson = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8'),
  );

  assert.equal(packageJson.dependencies['@capacitor/core'], '8.5.2');
  assert.equal(packageJson.devDependencies['@capacitor/cli'], undefined);
  assert.equal(packageJson.dependencies['@capacitor/ios'], undefined);
  assert.equal(packageJson.dependencies['@capacitor/android'], undefined);
});
