import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(process.cwd());

// Native project generation is validated against the committed Capacitor output.

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

  assert.equal(existsSync(resolve(root, 'ios/App/CapApp-SPM/Package.swift')), true);
  assert.equal(existsSync(resolve(root, 'android/settings.gradle')), true);
});

test('Android native manifest has no runtime permission beyond Capacitor network baseline', () => {
  const manifest = readFileSync(
    resolve(root, 'android/app/src/main/AndroidManifest.xml'),
    'utf8',
  );

  assert.match(manifest, /android\.permission\.INTERNET/);
  assert.doesNotMatch(manifest, /android\.permission\.(ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|CAMERA|RECORD_AUDIO|READ_CONTACTS|WRITE_CONTACTS|POST_NOTIFICATIONS)/);
});
