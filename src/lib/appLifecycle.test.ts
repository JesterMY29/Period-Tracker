import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

type Harness = {
  dom: JSDOM;
  root: { render: (element: React.ReactNode) => void; unmount: () => void };
  container: HTMLElement;
};

const SETTINGS_KEY = 'auracycle_settings_v2';
const LOGS_KEY = 'auracycle_logs_v2';

let App: React.ComponentType;
let createRoot: (container: Element | DocumentFragment) => Harness['root'];

function installDom(dom: JSDOM) {
  const win = dom.window as unknown as typeof globalThis;
  const globals: Record<string, unknown> = {
    window: win,
    document: dom.window.document,
    navigator: dom.window.navigator,
    localStorage: dom.window.localStorage,
    HTMLElement: dom.window.HTMLElement,
    HTMLInputElement: dom.window.HTMLInputElement,
    Node: dom.window.Node,
    Event: dom.window.Event,
    MouseEvent: dom.window.MouseEvent,
    KeyboardEvent: dom.window.KeyboardEvent,
    File: dom.window.File,
    FileReader: dom.window.FileReader,
    URL: dom.window.URL,
    getComputedStyle: dom.window.getComputedStyle,
  };

  dom.window.matchMedia = dom.window.matchMedia || (() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return false; },
  })) as typeof dom.window.matchMedia;

  dom.window.requestAnimationFrame = dom.window.requestAnimationFrame || ((callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 0) as unknown as number);
  dom.window.cancelAnimationFrame = dom.window.cancelAnimationFrame || ((id: number) => clearTimeout(id));
  dom.window.URL.createObjectURL = dom.window.URL.createObjectURL || (() => 'blob:auracycle-test');
  dom.window.URL.revokeObjectURL = dom.window.URL.revokeObjectURL || (() => undefined);

  for (const [key, value] of Object.entries(globals)) {
    if (key === 'navigator') {
      // Node 21+ exposes a read-only global navigator accessor. Define the
      // jsdom navigator explicitly instead of assigning through that accessor.
      Object.defineProperty(globalThis, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value,
      });
    } else {
      (globalThis as Record<string, unknown>)[key] = value;
    }
  }
}

async function setup(): Promise<Harness> {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'https://auracycle.test/',
    pretendToBeVisual: true,
  });
  installDom(dom);

  if (!App) {
    ({ default: App } = await import('../App'));
    ({ createRoot } = await import('react-dom/client'));
  }

  const container = dom.window.document.getElementById('root');
  assert.ok(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(App));
  });
  return { dom, root, container };
}

async function reload(harness: Harness) {
  await act(async () => {
    harness.root.unmount();
  });
  const root = createRoot(harness.container);
  harness.root = root;
  await act(async () => {
    root.render(React.createElement(App));
  });
}

async function cleanup(harness: Harness) {
  await act(async () => {
    harness.root.unmount();
  });
  harness.dom.window.close();
}

function button(container: HTMLElement, label: RegExp): HTMLButtonElement {
  const match = Array.from(container.querySelectorAll('button')).find(candidate => label.test(candidate.textContent?.trim() || ''));
  assert.ok(match, `button ${label} should exist`);
  return match as HTMLButtonElement;
}

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

function setInputValue(input: HTMLInputElement, value: string) {
  act(() => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

function goTo(container: HTMLElement, label: RegExp) {
  click(button(container, label));
}

async function saveLog(harness: Harness, date: string, flow: string, notes?: string) {
  click(button(harness.container, /^Log( today)?$/));
  await flush();

  const dateInput = harness.container.querySelector('#log-date') as HTMLInputElement | null;
  assert.ok(dateInput);
  setInputValue(dateInput, date);

  click(button(harness.container, new RegExp(`^${flow}$`)));

  if (notes) {
    const textarea = harness.container.querySelector('textarea');
    assert.ok(textarea);
    setInputValue(textarea as HTMLInputElement, notes);
  }

  click(button(harness.container, /^Save check-in$/));
  await flush();
}

async function openCalendarRecord(harness: Harness, date: string) {
  goTo(harness.container, /^Calendar$/);
  await flush();
  const day = harness.container.querySelector(`button[aria-label^="${date}"]`);
  assert.ok(day, `calendar day ${date} should exist`);
  click(day);
  await flush();
}

async function openSettings(harness: Harness) {
  goTo(harness.container, /^Settings$/);
  await flush();
}

async function clearAll(harness: Harness) {
  await openSettings(harness);
  click(button(harness.container, /^DELETE ALL DATA$/));
  await flush();
  click(button(harness.container, /^YES, DELETE$/));
  await flush();
}

function historyLoggedDays(container: HTMLElement): string {
  const cards = Array.from(container.querySelectorAll('div')).filter(node => node.textContent?.trim() === 'Logged days');
  assert.ok(cards.length > 0);
  const card = cards[0].parentElement;
  assert.ok(card);
  const value = card.querySelector('p.font-serif');
  return value?.textContent?.trim() || '';
}

test('P01 — Save → reload preserves the recorded log in the application', async () => {
  const harness = await setup();
  try {
    await clearAll(harness);
    await saveLog(harness, '2026-08-10', 'Medium', 'initial entry');
    assert.ok(harness.dom.window.localStorage.getItem(LOGS_KEY));

    await reload(harness);
    goTo(harness.container, /^History$/);
    await flush();
    assert.equal(historyLoggedDays(harness.container), '1');
  } finally {
    await cleanup(harness);
  }
});

test('P02 — Settings → reload preserves the saved baseline in the application', async () => {
  const harness = await setup();
  try {
    await clearAll(harness);
    await openSettings(harness);
    const inputs = harness.container.querySelectorAll('input[type="number"]');
    assert.equal(inputs.length, 2);
    setInputValue(inputs[0] as HTMLInputElement, '31');
    setInputValue(inputs[1] as HTMLInputElement, '6');
    click(button(harness.container, /^SAVE BASELINE$/));
    await flush();

    await reload(harness);
    await openSettings(harness);
    const restored = harness.container.querySelectorAll('input[type="number"]');
    assert.equal((restored[0] as HTMLInputElement).value, '31');
    assert.equal((restored[1] as HTMLInputElement).value, '6');
  } finally {
    await cleanup(harness);
  }
});

test('P03 — Logs + settings → reload preserves the combined application state', async () => {
  const harness = await setup();
  try {
    await clearAll(harness);
    await saveLog(harness, '2026-08-10', 'Light', 'combined state');
    await openSettings(harness);
    const inputs = harness.container.querySelectorAll('input[type="number"]');
    setInputValue(inputs[0] as HTMLInputElement, '30');
    setInputValue(inputs[1] as HTMLInputElement, '5');
    click(button(harness.container, /^SAVE BASELINE$/));
    await flush();

    await reload(harness);
    await openSettings(harness);
    const restored = harness.container.querySelectorAll('input[type="number"]');
    assert.equal((restored[0] as HTMLInputElement).value, '30');
    assert.equal((restored[1] as HTMLInputElement).value, '5');
    goTo(harness.container, /^History$/);
    await flush();
    assert.equal(historyLoggedDays(harness.container), '1');
  } finally {
    await cleanup(harness);
  }
});

test('P04 — Clear All → reload produces a genuinely clean application state', async () => {
  const harness = await setup();
  try {
    await clearAll(harness);
    await saveLog(harness, '2026-08-10', 'Heavy');
    await openSettings(harness);
    const inputs = harness.container.querySelectorAll('input[type="number"]');
    setInputValue(inputs[0] as HTMLInputElement, '33');
    click(button(harness.container, /^SAVE BASELINE$/));
    await flush();

    await clearAll(harness);
    await reload(harness);
    await openSettings(harness);
    const restored = harness.container.querySelectorAll('input[type="number"]');
    assert.equal((restored[0] as HTMLInputElement).value, '28');
    assert.equal((restored[1] as HTMLInputElement).value, '5');
    goTo(harness.container, /^History$/);
    await flush();
    assert.equal(historyLoggedDays(harness.container), '0');
  } finally {
    await cleanup(harness);
  }
});

test('P05 — Historical edit → reload keeps the edited record authoritative', async () => {
  const harness = await setup();
  try {
    await clearAll(harness);
    await saveLog(harness, '2026-08-10', 'Light', 'before edit');
    await reload(harness);
    await openCalendarRecord(harness, '2026-08-10');

    const textarea = harness.container.querySelector('textarea');
    assert.ok(textarea);
    setInputValue(textarea as HTMLInputElement, 'after edit');
    click(button(harness.container, /^Save check-in$/));
    await flush();

    await reload(harness);
    await openCalendarRecord(harness, '2026-08-10');
    const restoredTextarea = harness.container.querySelector('textarea') as HTMLTextAreaElement | null;
    assert.ok(restoredTextarea);
    assert.equal(restoredTextarea.value, 'after edit');
  } finally {
    await cleanup(harness);
  }
});

test('P06 — Historical deletion → reload keeps the deletion authoritative', async () => {
  const harness = await setup();
  try {
    await clearAll(harness);
    await saveLog(harness, '2026-08-10', 'Medium');
    await reload(harness);
    await openCalendarRecord(harness, '2026-08-10');

    click(button(harness.container, /Delete this day/));
    await flush();
    click(button(harness.container, /^Yes, delete$/));
    await flush();

    await reload(harness);
    goTo(harness.container, /^History$/);
    await flush();
    assert.equal(historyLoggedDays(harness.container), '0');
  } finally {
    await cleanup(harness);
  }
});

test('P07 — Import → reload preserves imported logs and settings', async () => {
  const harness = await setup();
  try {
    await clearAll(harness);
    await openSettings(harness);
    const input = harness.container.querySelector('input[type="file"]') as HTMLInputElement | null;
    assert.ok(input);

    const payload = JSON.stringify({
      settings: { startingCycleLength: 32, startingPeriodLength: 6 },
      logs: [{ date: '2026-08-11', flow: 'Heavy', symptoms: [], notes: 'imported' }],
    });
    const file = new harness.dom.window.File([payload], 'auracycle-backup.json', { type: 'application/json' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    act(() => {
      input.dispatchEvent(new harness.dom.window.Event('change', { bubbles: true }));
    });
    await new Promise(resolve => setTimeout(resolve, 10));
    await flush();

    await reload(harness);
    await openSettings(harness);
    const restored = harness.container.querySelectorAll('input[type="number"]');
    assert.equal((restored[0] as HTMLInputElement).value, '32');
    assert.equal((restored[1] as HTMLInputElement).value, '6');
    goTo(harness.container, /^History$/);
    await flush();
    assert.equal(historyLoggedDays(harness.container), '1');
  } finally {
    await cleanup(harness);
  }
});

test('P08 — Corrupt persistence → reload recovers safely to defaults', async () => {
  const harness = await setup();
  try {
    harness.dom.window.localStorage.setItem(LOGS_KEY, '{not-valid-json');
    harness.dom.window.localStorage.setItem(SETTINGS_KEY, '{not-valid-json');
    await reload(harness);

    await openSettings(harness);
    const restored = harness.container.querySelectorAll('input[type="number"]');
    assert.equal((restored[0] as HTMLInputElement).value, '28');
    assert.equal((restored[1] as HTMLInputElement).value, '5');
    goTo(harness.container, /^History$/);
    await flush();
    assert.equal(historyLoggedDays(harness.container), '0');
  } finally {
    await cleanup(harness);
  }
});
