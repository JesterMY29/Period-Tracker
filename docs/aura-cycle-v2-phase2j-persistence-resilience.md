# AuraCycle V2 — Phase 2J: Runtime Persistence Resilience

## Objective

Harden the local-first persistence boundary so a browser storage failure cannot silently pass as a successful save.

## Scope

- Wrap localStorage writes in a small deterministic safety boundary.
- Keep the authoritative application state in React memory.
- Surface a clear, non-blocking warning when the current state cannot be persisted.
- Persist logs and settings from the same state snapshot so the warning reflects the current save attempt.
- Keep clear-all behavior authoritative in application state and let the persistence effect serialize the cleared state.
- Add focused regression coverage for successful and failed storage writes.

## Non-goals

- No new product features.
- No cycle-engine or prediction changes.
- No data-model rewrite.
- No Gemini/AI.
- No accounts or cloud sync.
- No ads or tracking.
- No third-party persistence service.

## Safety contract

1. A storage exception must never crash the application.
2. A failed write must be visible to the user rather than represented as a successful save.
3. The in-memory state remains authoritative until the user changes it again.
4. Successful writes clear the persistence warning on the next synchronized state snapshot.
5. Existing normalization, historical edits, deletion semantics, and deterministic prediction remain unchanged.

## Exit criteria

- Storage write exceptions are contained.
- The UI reports a current persistence failure.
- Logs and settings continue using the existing serialization format.
- Existing test, typecheck, and production-build gates remain green.
- No scope expansion beyond runtime persistence resilience.
