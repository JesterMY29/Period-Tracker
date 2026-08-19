# AuraCycle V2 Phase 3C — Reliability & Adversarial Data Testing

## Objective

Stress the deterministic core with malformed data, duplicate records, large histories, numeric edge cases, and repeated prediction calculations without changing the product model.

## Added coverage

- large valid history normalization;
- duplicate-date collision behavior;
- strict backup rejection for duplicate records;
- `NaN` and infinite settings rejection;
- malformed log container rejection without exceptions;
- caller-owned input immutability;
- deterministic prediction across a longer history.

## Existing coverage retained

The repository already contains tests for:

- cycle calculations and edge cases;
- prediction confidence and baseline boundaries;
- historical date edits;
- persistence failures and retry behavior;
- import/export validation;
- logging safety;
- navigation state;
- quick logging.

Phase 3C adds adversarial cases rather than replacing the existing suite.

## Verification gate

Phase 3C is GREEN only when:

- [ ] all tests pass;
- [ ] typecheck passes;
- [ ] production build passes;
- [ ] dependency audit remains green;
- [ ] no data-integrity regression appears;
- [ ] no prediction nondeterminism appears;
- [ ] Vercel preview is READY;
- [ ] production runtime remains error-free after merge.

## HOLD conditions

- malformed input throws unexpectedly;
- duplicate history can be imported as valid;
- large histories lose valid records;
- prediction changes between identical inputs;
- persistence or historical-edit behavior regresses.

## Next checkpoint

After Phase 3C is GREEN, proceed to **Phase 3D — Accessibility & Human-Factors Acceptance**.
