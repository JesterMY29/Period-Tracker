# AuraCycle V2 — Phase 2G Product Polish & Accessibility

Status: **Implementation checkpoint**

Branch: `auracycle-v2-phase2g-product-polish`

## Objective

Finish the V2 product-polish layer without changing the deterministic cycle engine, prediction model, logging data model, or privacy architecture.

## Scope

- Add a keyboard-accessible skip link to the main application content.
- Give the main content a stable focus target for keyboard and assistive-technology navigation.
- Reduce repeated infrastructure-oriented footer language and communicate the local-data promise in product language.
- Improve the logging dialog's accessibility semantics with an explicit description.
- Move initial focus to the dialog close action when the editor opens.
- Allow `Escape` to close the logging dialog.
- Restore focus to the previously active element when the dialog closes.
- Mark decorative icons as hidden from assistive technology where they do not convey additional information.

## Explicit non-goals

- No cycle-engine changes.
- No prediction algorithm changes.
- No persistence or data-model rewrite.
- No Gemini/AI.
- No accounts or cloud sync.
- No ads/tracking.
- No medical claims.
- No new feature category.

## Quality gate

Merge only after the full AuraCycle Quality Gate is green.

## Exit criteria

- Keyboard users can bypass the persistent header/navigation.
- Main content has a deterministic focus target.
- Opening the day editor places focus inside the dialog.
- `Escape` closes the day editor.
- Closing the editor returns focus to the previous control where possible.
- Existing logging, deletion, persistence, prediction, and navigation behavior remains unchanged.
- Tests, type-check, and production build remain green.
