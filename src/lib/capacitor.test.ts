import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(process.cwd());

test('Capacitor configuration targets the production Vite output', () => {
  const source = readFileSync(resolve(root, 'capacitor.config.ts'), 'utf8');

  assert.match(source, /appId:\s*'com\.auracycle\.app'/);
  assert.match(source, /appName:\s*'AuraCycle'/);
  assert.match(source, /webDir:\s*'dist'/);
  assert.match(source, /bundledWebRuntime:\s*false/);
});

test('Capacitor packaging stays dependency-minimal', () => {
  const packageJson = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8'),
  );

  assert.equal(packageJson.dependencies['@capacitor/core'], '8.5.2');
  assert.equal(packageJson.devDependencies['@capacitor/cli'], '8.5.2');
  assert.equal(packageJson.dependencies['@capacitor/ios'], undefined);
  assert.equal(packageJson.dependencies['@capacitor/android'], undefined);
});
