# AuraCycle V2 Phase 2K — Release Candidate & End-to-End Integrity

## Decision

Phase 2K is a release-candidate gate, not a feature-development phase.

The purpose is to prove that the existing AuraCycle V2 product remains trustworthy as a complete system after Phases 1 and 2B–2J.

No engine rewrite, AI integration, cloud sync, account system, advertising, tracking, or unrelated feature expansion is permitted in this phase.

## Product invariants

- Local-first: cycle records and settings remain on the user's device.
- Deterministic: the same validated inputs produce the same prediction outputs.
- Historical edits are authoritative.
- Historical deletion is authoritative.
- Persistence is explicit; a failed storage write must not be presented as a successful save.
- Import/restore remains validated and deterministic.
- No Gemini or other AI dependency is required for core functionality.
- No account or cloud-sync dependency exists for core functionality.
- No advertising or analytics/tracking dependency exists.

## Automated release evidence

The repository quality workflow must remain green for:

1. `npm test`
2. `npm run lint`
3. `npm run build`

Existing application-lifecycle coverage already exercises the highest-risk user journeys, including:

- save → reload
- settings → reload
- combined logs + settings → reload
- clear all → reload
- historical edit → reload
- historical deletion → reload
- import → reload
- corrupt persistence → safe recovery

## Production acceptance matrix

Perform these checks against the production deployment before declaring the release candidate accepted.

### A. Core logging

- [ ] One-tap period/flow logging works.
- [ ] Detailed logging can be opened for today.
- [ ] A historical date can be opened and edited.
- [ ] Cancel leaves an existing record unchanged.
- [ ] Escape leaves an existing record unchanged when a draft is dirty.
- [ ] Reverting a draft clears the dirty state.

### B. Prediction integrity

- [ ] Prediction appears only when sufficient record history exists.
- [ ] Editing a historical period start changes the derived prediction.
- [ ] Deleting a historical period start removes the cycle contribution it created.
- [ ] Prediction remains deterministic after reload.

### C. Persistence integrity

- [ ] Save → reload preserves records.
- [ ] Save → reload preserves settings.
- [ ] Clear all → reload produces a clean state.
- [ ] Corrupt persisted data does not crash the application.
- [ ] A storage-write failure is surfaced rather than silently reported as saved.
- [ ] Retry save can recover after the storage boundary becomes available again.

### D. Navigation and state

- [ ] Home, Calendar, History, and Settings remain reachable.
- [ ] Navigation does not mutate cycle records unexpectedly.
- [ ] Browser refresh preserves the selected application state where supported.
- [ ] Opening a calendar date opens the correct record.

### E. Data trust

- [ ] Export/backup produces a valid deterministic payload.
- [ ] Valid import restores the expected records and settings.
- [ ] Invalid import is rejected safely.
- [ ] Existing records are not partially overwritten by an invalid restore.

### F. Product/privacy constraints

- [ ] Core functionality works without Gemini or another AI service.
- [ ] No account/login is required.
- [ ] No cloud-sync step is required.
- [ ] No advertising or tracking UI appears.
- [ ] Privacy copy remains accurate: records stay on the device.

## Release decision rule

**PASS** when automated quality checks are green, production deployment is healthy, and all blocking acceptance items above pass.

**HOLD** when any data-loss, prediction-determinism, persistence, navigation-state, or privacy invariant fails.

Cosmetic issues that do not affect these invariants should be logged separately rather than expanding the release-candidate scope.

## Evidence recorded for the current candidate

- Phase 2I merged after Quality Gate 88.
- Phase 2J merged after Quality Gate 91.
- Quality Gate 92 is green on `main`.
- Current production deployment is `READY` and points to the Phase 2J merge commit.
- No Vercel runtime errors were reported for the preceding 24-hour window at the Phase 2K decision point.

## Exit criteria

When the automated checks and production acceptance matrix are green, AuraCycle V2 should move to release preparation rather than another feature phase.

The next work after Phase 2K should be limited to release packaging, deployment hygiene, documentation, and explicitly discovered blocking defects.
