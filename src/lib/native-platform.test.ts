import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(process.cwd());

test('Capacitor native project contract is pinned and generated', () => {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  const config = JSON.parse(readFileSync(resolve(root, 'capacitor.config.json'), 'utf8'));

  assert.equal(pkg.dependencies['@capacitor/core'], '8.5.2');
  assert.equal(pkg.dependencies['@capacitor/ios'], '8.5.2');
  assert.equal(pkg.dependencies['@capacitor/android'], '8.5.2');
  assert.equal(pkg.devDependencies['@capacitor/cli'], '8.5.2');

  assert.equal(config.appId, 'com.auracycle.app');
  assert.equal(config.appName, 'AuraCycle');
  assert.equal(config.webDir, 'dist');
  assert.equal(config.loggingBehavior, 'none');

  assert.ok(resolve(root, 'ios/App/Package.swift'));
  assert.ok(resolve(root, 'android/settings.gradle'));
});

test('Android native manifest has no runtime permission beyond Capacitor network baseline', () => {
  const manifest = readFileSync(
    resolve(root, 'android/app/src/main/AndroidManifest.xml'),
    'utf8',
  );

  assert.match(manifest, /android\.permission\.INTERNET/);
  assert.doesNotMatch(manifest, /android\.permission\.(ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|CAMERA|RECORD_AUDIO|READ_CONTACTS|WRITE_CONTACTS|POST_NOTIFICATIONS)/);
});
