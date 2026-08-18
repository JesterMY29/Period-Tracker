# AuraCycle V2 — Phase 2H Logging Safety

Status: **Implementation checkpoint**

Branch: `auracycle-v2-phase2h-logging-safety`

## Objective

Protect users from accidentally discarding unsaved edits while keeping the logging interaction lightweight and local-first.

## Scope

- Detect edits to the open day-log draft against the authoritative values loaded when the editor opened.
- Guard the close button, Cancel action, and `Escape` from silently discarding unsaved changes.
- Allow explicit discard confirmation through the browser's native confirmation dialog.
- Keep Save and confirmed Delete authoritative actions unblocked.
- Preserve the existing persistence path, data model, cycle engine, prediction logic, and accessibility behavior.

## Explicit non-goals

- No cycle-engine changes.
- No prediction algorithm changes.
- No persistence/data-model rewrite.
- No Gemini/AI.
- No accounts or cloud sync.
- No ads/tracking.
- No new logging fields.
- No medical claims.

## Safety contract

**Edit → close attempt → detect draft divergence → confirm discard → close only when explicitly accepted.**

If no values changed, closing remains immediate.

## Exit criteria

- Opening an existing record establishes a stable draft baseline.
- Opening a new record establishes an empty draft baseline.
- Changing date, flow, mood, symptoms, or notes makes the draft dirty.
- Returning fields to their original values clears the dirty state.
- Close/Cancel/Escape never silently discard a dirty draft.
- Save remains immediate and authoritative.
- Delete remains explicitly confirmed and authoritative.
- Existing tests, type-check, and production build remain green.
