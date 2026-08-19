# Security Policy

## Scope

AuraCycle is a local-first cycle-tracking application. Cycle records and settings are intended to remain on the user's device, and the core product does not require an account, cloud sync, advertising, tracking, or AI service.

## Reporting a vulnerability

Please report suspected security vulnerabilities privately through GitHub's repository security reporting mechanisms when available. Do not publish secrets, private health data, exploit payloads containing real user data, or other sensitive information in a public issue.

When reporting, include:

- affected component or file;
- reproduction steps;
- expected versus observed behavior;
- impact assessment;
- relevant browser/OS/runtime information; and
- a minimal proof of concept when safe to provide.

## Release security requirements

Production releases are blocked by unresolved high-severity dependency audit findings and by defects involving data integrity, persistence, privacy, or production runtime safety.

Security fixes are evaluated independently from feature work. AuraCycle V2 remains feature-frozen during release hardening.
