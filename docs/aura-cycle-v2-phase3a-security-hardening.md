# AuraCycle V2 Phase 3A — Production Security Hardening

## Objective

Make the Phase 2L production candidate trustworthy without expanding the product surface.

Phase 3A is a hardening phase. It does not add user-facing features and does not reintroduce Gemini or another AI dependency into core functionality.

## Baseline

- Phase 2L production candidate: `627587f1a991511a291f08f171ec4d4906395d1d`
- Production deployment for that candidate: READY
- Automated quality gate remains blocking.
- The current repository contains no `api/` Gemini runtime path; historical production runtime errors from older deployments are not treated as current V2 core failures.

## Security decisions implemented

### 1. Canonical production package manager

The repository previously contained a stale `bun.lock` whose dependency graph included packages that are no longer declared by `package.json`, including the former Gemini dependency.

Phase 3A removes that stale lockfile and explicitly sets Vercel to use `npm install`, matching the GitHub Actions quality workflow.

This prevents an obsolete lockfile from silently defining the production dependency graph.

### 2. Security-relevant dependency baseline

The production candidate now pins the security-sensitive tooling baseline to maintained patch lines:

- Express `4.22.2`
- Vite `6.4.3`
- esbuild `0.28.1`
- `@vitejs/plugin-react` `5.1.4`

Vite `6.4.3` addresses the 2026 Windows `server.fs.deny` bypass affecting earlier Vite 6 releases. esbuild `0.28.1` contains the 2026 Windows development-server path traversal fix.

### 3. Node runtime consistency

Node `22.x` is declared for the project and explicitly selected in CI. This removes runtime-version drift between quality checks and production builds.

### 4. Blocking dependency audit

The quality workflow now runs:

`npm audit --audit-level=high`

A high or critical dependency vulnerability blocks the quality job.

### 5. Production security headers

Vercel now sends a restrictive baseline including:

- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- X-Frame-Options
- Strict-Transport-Security

The CSP permits only same-origin application resources plus the existing Google Fonts endpoints required by the current visual design. Removing that third-party font dependency is intentionally deferred to the privacy-hardening checkpoint rather than mixed into the security change.

## Verification gate

Phase 3A is GREEN only when all of the following are true:

- [ ] npm dependency audit passes at high severity threshold;
- [ ] tests pass;
- [ ] typecheck passes;
- [ ] production build passes;
- [ ] Vercel preview deployment is READY;
- [ ] Vercel production deployment points to the merged hardening commit;
- [ ] production response headers match the configured security baseline;
- [ ] no new production runtime errors appear after deployment;
- [ ] no stale Gemini/API runtime is present in the shipped V2 candidate.

## HOLD conditions

Immediately HOLD if any of these occur:

- high/critical dependency vulnerability remains unresolved;
- build or deployment fails;
- CSP blocks core application behavior;
- security headers cause a core regression;
- production exposes a stale AI/API surface that is not part of the frozen V2 product;
- any data-integrity, persistence, privacy, or runtime blocker appears.

## Next checkpoint

After Phase 3A is GREEN, proceed to **Phase 3B — Privacy Hardening**.

Phase 3B will specifically address third-party asset minimization, privacy/data-flow review, and confirmation that no cycle data leaves the device through the shipped client.
