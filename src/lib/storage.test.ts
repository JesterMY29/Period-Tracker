import assert from 'node:assert/strict';
import test from 'node:test';
import { writeStorageItem } from './storage';

test('STORAGE 01 — write succeeds when local storage accepts the value', () => {
  const previousWindow = globalThis.window;
  const writes: Array<[string, string]> = [];

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        setItem: (key: string, value: string) => writes.push([key, value]),
      },
    },
  });

  try {
    assert.equal(writeStorageItem('auracycle_test', 'payload'), true);
    assert.deepEqual(writes, [['auracycle_test', 'payload']]);
  } finally {
    if (previousWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: previousWindow,
      });
    }
  }
});

test('STORAGE 02 — write failure is contained and reported', () => {
  const previousWindow = globalThis.window;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        setItem: () => {
          throw new Error('quota exceeded');
        },
      },
    },
  });

  try {
    assert.equal(writeStorageItem('auracycle_test', 'payload'), false);
  } finally {
    if (previousWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: previousWindow,
      });
    }
  }
});
