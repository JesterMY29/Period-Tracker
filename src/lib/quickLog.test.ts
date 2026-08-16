import assert from 'node:assert/strict';
import test from 'node:test';
import { createQuickFlowLog } from './quickLog';
import { DayLog } from '../types';

test('quick flow logging creates a minimal valid daily record', () => {
  assert.deepEqual(createQuickFlowLog('2026-08-17', 'Medium'), {
    date: '2026-08-17',
    flow: 'Medium',
    symptoms: [],
  });
});

test('quick flow logging preserves optional details on an existing record', () => {
  const existing: DayLog = {
    date: '2026-08-17',
    flow: 'Light',
    mood: 'Good',
    symptoms: ['Cramps', 'Fatigue'],
    notes: 'Keep this note',
  };

  const updated = createQuickFlowLog('2026-08-17', 'Heavy', existing);

  assert.deepEqual(updated, {
    date: '2026-08-17',
    flow: 'Heavy',
    mood: 'Good',
    symptoms: ['Cramps', 'Fatigue'],
    notes: 'Keep this note',
  });
  assert.notEqual(updated.symptoms, existing.symptoms);
});
