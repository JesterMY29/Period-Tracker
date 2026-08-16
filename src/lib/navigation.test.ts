import assert from 'node:assert/strict';
import test from 'node:test';
import { APP_TABS, DEFAULT_APP_TAB, resolveAppTab } from './navigation';

test('navigation contract exposes exactly the four application tabs', () => {
  assert.deepEqual(APP_TABS, ['home', 'calendar', 'history', 'settings']);
  assert.equal(DEFAULT_APP_TAB, 'home');
});

test('navigation resolves every supported tab without changing it', () => {
  for (const tab of APP_TABS) {
    assert.equal(resolveAppTab(tab), tab);
  }
});

test('navigation fails closed to Home for unknown or missing state', () => {
  assert.equal(resolveAppTab('unknown'), 'home');
  assert.equal(resolveAppTab(''), 'home');
  assert.equal(resolveAppTab(null), 'home');
  assert.equal(resolveAppTab(undefined), 'home');
});
