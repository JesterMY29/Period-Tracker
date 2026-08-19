import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SymptomLoggerModal } from '../components/SymptomLoggerModal';
import type { DayLog } from '../types';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

type Harness = {
  dom: JSDOM;
  root: ReturnType<typeof createRoot>;
  container: HTMLElement;
};

function installDom(dom: JSDOM) {
  const win = dom.window as unknown as typeof globalThis;
  const globals: Record<string, unknown> = {
    window: win,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    HTMLInputElement: dom.window.HTMLInputElement,
    HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
    Node: dom.window.Node,
    Event: dom.window.Event,
    KeyboardEvent: dom.window.KeyboardEvent,
    getComputedStyle: dom.window.getComputedStyle,
  };

  for (const [key, value] of Object.entries(globals)) {
    if (key === 'navigator') {
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

async function setup(existingLog?: DayLog, onSaveLog?: (log: DayLog, previousDate?: string) => boolean): Promise<Harness> {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'https://auracycle.test/',
    pretendToBeVisual: true,
  });
  installDom(dom);

  const container = dom.window.document.getElementById('root');
  assert.ok(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(React.createElement(SymptomLoggerModal, {
      isOpen: true,
      selectedDate: '2026-08-10',
      existingLog,
      onClose: () => {
        root.render(null);
      },
      onSaveLog: onSaveLog || (() => true),
      onDeleteLog: () => undefined,
    }));
  });

  return { dom, root, container };
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

async function click(element: Element) {
  await act(async () => {
    (element as HTMLElement).click();
  });
}

async function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  await act(async () => {
    const prototype = Object.getPrototypeOf(input);
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new (input.ownerDocument.defaultView?.Event || Event)('input', { bubbles: true }));
    input.dispatchEvent(new (input.ownerDocument.defaultView?.Event || Event)('change', { bubbles: true }));
  });
}

function dialog(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[role="dialog"]');
}

test('P2I-01 — clean close does not invoke discard confirmation', async () => {
  const harness = await setup();
  try {
    let confirmCalls = 0;
    harness.dom.window.confirm = () => {
      confirmCalls += 1;
      return false;
    };

    await click(button(harness.container, /^Cancel$/));

    assert.equal(confirmCalls, 0);
    assert.equal(dialog(harness.container), null);
  } finally {
    await cleanup(harness);
  }
});

test('P2I-02 — dirty Cancel blocks on rejection and closes on explicit discard', async () => {
  const harness = await setup();
  try {
    let confirmCalls = 0;
    harness.dom.window.confirm = () => {
      confirmCalls += 1;
      return confirmCalls > 1;
    };

    const flowButton = button(harness.container, /^Medium/);
    await click(flowButton);

    await click(button(harness.container, /^Cancel$/));
    assert.equal(confirmCalls, 1);
    assert.ok(dialog(harness.container), 'dirty draft should remain open when discard is rejected');

    await click(button(harness.container, /^Cancel$/));
    assert.equal(confirmCalls, 2);
    assert.equal(dialog(harness.container), null);
  } finally {
    await cleanup(harness);
  }
});

test('P2I-03 — Escape uses the same discard safety contract', async () => {
  const harness = await setup();
  try {
    let confirmCalls = 0;
    harness.dom.window.confirm = () => {
      confirmCalls += 1;
      return confirmCalls > 1;
    };

    const textarea = harness.container.querySelector('textarea');
    assert.ok(textarea);
    await setInputValue(textarea, 'unsaved observation');

    await act(async () => {
      harness.dom.window.document.dispatchEvent(new harness.dom.window.KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }));
    });
    assert.equal(confirmCalls, 1);
    assert.ok(dialog(harness.container));

    await act(async () => {
      harness.dom.window.document.dispatchEvent(new harness.dom.window.KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }));
    });
    assert.equal(confirmCalls, 2);
    assert.equal(dialog(harness.container), null);
  } finally {
    await cleanup(harness);
  }
});

test('P2I-04 — reverting an edited field clears dirty state against the original record', async () => {
  const existingLog: DayLog = {
    date: '2026-08-10',
    flow: 'Light',
    mood: 'Good',
    symptoms: ['Cramps'],
    notes: 'baseline note',
  };
  const harness = await setup(existingLog);
  try {
    let confirmCalls = 0;
    harness.dom.window.confirm = () => {
      confirmCalls += 1;
      return false;
    };

    const dateInput = harness.container.querySelector('#log-date') as HTMLInputElement | null;
    const textarea = harness.container.querySelector('textarea');
    assert.ok(dateInput);
    assert.ok(textarea);

    await setInputValue(dateInput, '2026-08-11');
    await setInputValue(dateInput, '2026-08-10');
    await setInputValue(textarea, 'temporary change');
    await setInputValue(textarea, 'baseline note');

    await click(button(harness.container, /^Cancel$/));

    assert.equal(confirmCalls, 0);
    assert.equal(dialog(harness.container), null);
  } finally {
    await cleanup(harness);
  }
});

test('P2I-05 — saving a date-corrected record identifies the original date', async () => {
  const existingLog: DayLog = {
    date: '2026-08-10',
    flow: 'Light',
    symptoms: [],
  };
  let previousDate: string | undefined;
  const harness = await setup(existingLog, (_log, originalDate) => {
    previousDate = originalDate;
    return true;
  });

  try {
    const dateInput = harness.container.querySelector('#log-date') as HTMLInputElement | null;
    assert.ok(dateInput);
    await setInputValue(dateInput, '2026-08-11');
    await click(button(harness.container, /^Save check-in$/));

    assert.equal(previousDate, '2026-08-10');
    assert.equal(dialog(harness.container), null);
  } finally {
    await cleanup(harness);
  }
});
