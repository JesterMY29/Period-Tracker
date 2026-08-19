# AuraCycle V2 Phase 3B — Privacy Hardening

## Objective

Reduce unnecessary third-party data exposure and make the local-first promise technically enforceable at the browser boundary.

## Findings

The production HTML previously loaded Google Fonts from `fonts.googleapis.com` and `fonts.gstatic.com`. That request was unrelated to cycle tracking and was the remaining avoidable third-party asset dependency in the shipped page.

Repository inspection found no application-level `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, analytics, tracking SDK, or Gemini client in the current V2 codebase.

## Changes implemented

- Remove Google Fonts `<link>` and preconnect tags from the production HTML.
- Use system/fallback typography stacks so the visual hierarchy remains intact without a remote font dependency.
- Tighten the production CSP to same-origin scripts, styles, fonts, images, and connections.
- Keep the local-first storage architecture unchanged.
- Keep export/import local and user-controlled.

## Privacy invariants

- Cycle records remain in browser local storage.
- Settings remain in browser local storage.
- Core functionality does not require a network request.
- No analytics/tracking dependency is introduced.
- No account or cloud-sync dependency is introduced.
- No AI/Gemini dependency is introduced.

## Verification gate

Phase 3B is GREEN only when:

- [ ] tests pass;
- [ ] typecheck passes;
- [ ] production build passes;
- [ ] Vercel preview is READY;
- [ ] production HTML contains no third-party font or tracking requests;
- [ ] production CSP contains no third-party asset allow-list;
- [ ] no application code sends cycle data to a network endpoint;
- [ ] local logging still works;
- [ ] import/export still works;
- [ ] no new production runtime errors appear after deployment.

## HOLD conditions

- Any cycle/health data is transmitted without an explicit product requirement.
- A privacy change breaks core persistence or import/export.
- CSP blocks a core interaction.
- A new third-party telemetry or tracking dependency appears.
- Any production runtime or data-integrity blocker appears.

## Next checkpoint

After Phase 3B is GREEN, proceed to **Phase 3C — Reliability & Adversarial Data Testing**.
