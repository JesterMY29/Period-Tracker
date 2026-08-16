# AuraCycle V2 — Phase 2B Core Logging UX

Status: **Implementation checkpoint**

## Objective

Make daily flow logging effortless without changing the deterministic cycle engine or persistence contract.

## Product contract

- Local-first and deterministic.
- No AI/Gemini dependency.
- No accounts or cloud synchronization.
- No ads or tracking.
- No unrelated feature expansion.
- Existing date editing remains authoritative.
- Existing deletion remains authoritative.
- Existing persistence normalization remains authoritative.

## UX decision

The Home screen now exposes a **Quick log** control for today's flow. Selecting a flow writes the record immediately; optional mood, symptoms, and notes remain available through the existing detailed editor.

Quick logging must:

1. Require no typing for the common case.
2. Preserve optional fields when changing the flow of an existing record.
3. Reuse the existing `normalizeLogs` persistence path.
4. Keep the detailed editor available for historical edits and richer entries.
5. Remain usable on narrow mobile layouts.

## Regression invariants

- A new quick log creates one valid `DayLog`.
- Updating today's flow does not erase mood, symptoms, or notes.
- Duplicate-date resolution remains deterministic.
- Existing cycle detection and prediction behavior is unchanged.
- Reload persistence remains covered by the existing lifecycle/persistence suite.

## Exit criteria

Phase 2B is complete when:

- Quick flow logging is available from Home.
- Detailed editing remains available.
- Existing optional details survive quick flow changes.
- The full quality gate is green.
- No Phase 1 engine behavior is changed without a separate regression requirement.
