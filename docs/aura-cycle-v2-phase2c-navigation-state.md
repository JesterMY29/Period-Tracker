# AuraCycle V2 — Phase 2C Navigation & State Consistency

Status: **Implementation checkpoint**

## Objective

Make navigation predictable and keep the application inside one explicit tab-state contract without changing cycle calculations or persistence behavior.

## Product contract

- Local-first and deterministic.
- No AI/Gemini dependency.
- No accounts or cloud synchronization.
- No ads or tracking.
- No cycle-engine rewrite.
- Existing logging, editing, deletion, and persistence remain authoritative.

## Navigation contract

The application has exactly four top-level tabs:

1. Home
2. Calendar
3. History
4. Settings

Home is the safe default. Navigation state is centralized in `src/lib/navigation.ts` so the App shell and Header cannot silently drift into different tab contracts.

Unknown or missing navigation values fail closed to Home.

## Regression invariants

- Every supported tab resolves to itself.
- Unknown navigation state resolves to Home.
- Navigation changes do not alter logs or settings.
- Quick logging remains available from Home.
- Detailed editing remains available.
- Existing cycle detection and prediction behavior is unchanged.
- Existing persistence behavior remains unchanged.

## Exit criteria

Phase 2C is complete when:

- The four-tab navigation contract is centralized.
- Header and App use the same tab type.
- Navigation fallback behavior is regression-tested.
- The full AuraCycle Quality Gate is green.
- No Phase 1 or Phase 2B behavior changes without a separate requirement.
