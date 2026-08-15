# AuraCycle V2 — Cycle Engine Behavioral Specification

Status: Phase 1C

This document is the behavioral contract for the cycle engine. Tests should encode these rules; implementation changes must preserve them or update this specification intentionally.

## Period episode detection

1. Only logs with a flow value other than `None` participate in period detection.
2. Flow logs are evaluated chronologically.
3. Duplicate dates must never create an artificial cycle or extend a period by an extra day.
4. A flow entry exactly two calendar dates after the previous flow entry is treated as the same period episode. This represents one missed calendar-day log.
5. A flow entry three or more calendar dates after the previous flow entry starts a new period episode. This represents at least two missed calendar days.
6. A period episode starts on its first recorded flow day and ends on its last recorded flow day.
7. Non-flow logs do not create period episodes.
8. Long gaps are preserved; the engine must never invent additional periods solely because a gap is large.

## Cycle calculation

1. A completed cycle exists only when two distinct period episode starts are available.
2. Cycle length is the calendar-day difference between one period start and the next period start.
3. Cycle length must be positive.
4. Editing or deleting a period start must cause dependent cycle calculations and predictions to recalculate from the resulting history.
5. Input order must not affect the result.

## Prediction behavior

1. With no completed cycles, use the configured starting cycle length as a transparent baseline.
2. With completed cycles, use the most recent six completed cycles for the baseline estimate.
3. The typical cycle length uses the median rather than the arithmetic mean so one unusual cycle has less influence.
4. Prediction uncertainty must widen as cycle variability increases, within the configured safety limits.
5. Confidence must reflect both the amount of historical data and recent cycle variability.
6. The prediction is an estimate, not a guarantee or medical diagnosis.

## Data integrity

1. Malformed stored logs must not crash the application.
2. Invalid dates and invalid enum values must be rejected during normalization.
3. Duplicate dates must be canonicalized safely.
4. Imported settings must be normalized to safe values.
5. Empty or corrupted local data must recover to a usable state.

## Release gate

A Phase 1 engine change is not considered verified until the automated quality gate passes:

- adversarial unit tests
- typecheck
- production build

A failed gate blocks merge into the production branch.
