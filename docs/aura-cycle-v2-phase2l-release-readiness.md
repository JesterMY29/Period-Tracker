# AuraCycle V2 Phase 2L — Release Readiness & Production Acceptance

## Decision

Phase 2L is the final release-readiness gate for AuraCycle V2.

It is not a feature phase. The product is feature-frozen. Work is limited to production acceptance, release packaging, deployment hygiene, documentation, and explicitly discovered blocking defects.

## Product invariants — frozen

- Local-first: cycle records and settings remain on the user's device.
- Deterministic: identical validated inputs produce identical prediction outputs.
- Historical edits are authoritative.
- Historical deletion is authoritative.
- Persistence is explicit; failed writes must not be presented as successful saves.
- Import/restore is validated and deterministic.
- Core functionality has no Gemini or other AI dependency.
- No account or cloud-sync dependency exists for core functionality.
- No advertising or analytics/tracking dependency exists.
- No unrelated feature expansion is permitted during release readiness.

## Candidate baseline

- Phase 2K merged to `main`.
- Phase 2K merge commit: `db118471bafc36973da1851523ef521f4aee56db`.
- Quality Gate 93: GREEN.
- The candidate has passed the release-candidate and end-to-end integrity gate.

## Automated release gate

The repository quality workflow remains blocking and must stay green:

1. `npm test`
2. `npm run lint`
3. `npm run build`

No release decision may override a failing automated gate.

## Production acceptance matrix

Run these checks against the current production deployment.

### 1. Launch & baseline

- [ ] Production opens without a blocking runtime error.
- [ ] Home renders with a valid empty or existing-data state.
- [ ] No AI/Gemini dependency is required to reach or use core logging.
- [ ] No login/account step appears.
- [ ] No cloud-sync onboarding appears.
- [ ] No advertising or tracking UI appears.

### 2. Core logging

- [ ] One-tap period/flow logging succeeds.
- [ ] The saved record is immediately reflected in the current UI.
- [ ] Detailed logging can be opened for today.
- [ ] A historical date can be opened and edited.
- [ ] Cancel does not mutate the existing record.
- [ ] Dirty-draft escape/cancel does not silently overwrite the existing record.

### 3. Historical authority

- [ ] Editing a historical period start updates derived cycle state.
- [ ] Reload preserves the edited historical record.
- [ ] Deleting a historical period start removes its cycle contribution.
- [ ] Reload preserves the deletion.
- [ ] No stale historical record reappears after navigation or refresh.

### 4. Prediction integrity

- [ ] Predictions appear only when sufficient history exists.
- [ ] A historical edit produces the expected deterministic prediction change.
- [ ] A historical deletion removes the corresponding prediction contribution.
- [ ] Reload produces the same prediction for the same stored inputs.

### 5. Persistence resilience

- [ ] Save → reload preserves records.
- [ ] Save → reload preserves settings.
- [ ] Combined records + settings survive reload.
- [ ] Clear all → reload produces a clean state.
- [ ] Corrupt persisted data is handled without a crash.
- [ ] A failed storage write is surfaced rather than reported as success.
- [ ] Retry can recover when the storage boundary becomes available again.

### 6. Navigation & state consistency

- [ ] Home is reachable.
- [ ] Calendar is reachable.
- [ ] History is reachable.
- [ ] Settings is reachable.
- [ ] Navigation does not unexpectedly mutate records.
- [ ] Calendar date selection opens the correct record.
- [ ] Refresh does not produce impossible or contradictory application state.

### 7. Data trust

- [ ] Export/backup produces a valid deterministic payload.
- [ ] Valid import restores expected records and settings.
- [ ] Invalid import is rejected safely.
- [ ] Invalid restore does not partially overwrite existing records.

### 8. Release hygiene

- [ ] Production deployment is `READY`.
- [ ] The production deployment points to the intended release commit.
- [ ] No unexplained new runtime errors are present after deployment.
- [ ] Release documentation reflects the shipped product constraints.
- [ ] No feature work is introduced while closing release blockers.

## Defect classification

### BLOCKER

Any failure involving:

- data loss or silent data corruption;
- historical edit/delete authority;
- prediction determinism or incorrect cycle contribution;
- persistence failure being falsely reported as success;
- navigation causing unintended record mutation;
- privacy/product constraints being violated;
- a production-blocking runtime failure.

A blocker means **HOLD**. Fix it before release.

### NON-BLOCKING

Cosmetic or low-impact issues that do not affect data integrity, determinism, persistence, navigation/state consistency, privacy, or core logging reliability should be documented separately and deferred.

## Release decision rule

### RELEASE

Declare AuraCycle V2 RELEASED only when:

- automated quality checks are green;
- production is healthy;
- every blocking production acceptance item passes;
- no unresolved blocker remains;
- the shipped behavior matches the frozen product invariants.

### HOLD

Declare HOLD if any blocker fails. Do not compensate for a blocker with additional unrelated features.

## Post-release boundary

After a RELEASE decision, AuraCycle V2 enters maintenance mode.

The next workstream should be driven by real production evidence rather than speculative feature expansion. Any future feature must be separately scoped, justified, and gated; it must not be folded into the V2 release candidate.
