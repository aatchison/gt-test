# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, **please do not open a public issue**.

Instead, report it privately via [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability):

1. Go to the **Security** tab of this repository.
2. Click **Report a vulnerability**.
3. Fill in the details and submit.

We will acknowledge your report within **48 hours** and aim to release a fix within **14 days** for confirmed critical/high vulnerabilities.

## Supported Versions

Only the latest commit on `main` is actively maintained.

## Out of Scope

The following are **not** in scope for vulnerability reports:

- Issues requiring physical access to the server.
- Denial-of-service attacks against infrastructure we do not control.
- Social engineering of project contributors.
- Vulnerabilities in third-party dependencies — please report those upstream.

## Security Measures

This project implements the following security controls:

- **Password hashing**: bcrypt with cost factor 12.
- **Password policy**: Minimum 12 characters; must contain uppercase, lowercase, and a digit.
- **Email normalisation**: Emails are stored in lowercase to prevent duplicate accounts.
- **Timing-attack prevention**: bcrypt comparison always runs, even for unknown users.
- **Rate limiting**: Registration endpoint is limited to 5 requests per IP per 15 minutes.
- **Security headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Strict-Transport-Security`, and `Permissions-Policy` are set on all responses.
- **Session strategy**: JWT sessions (no server-side session store required).
- **Dependency auditing**: `npm audit` runs in CI against production dependencies and fails on critical findings.

## Known Exceptions

| Advisory | Severity | Reason not fixed |
|---|---|---|
| [GHSA-9g9p-9gw9-jx7f](https://github.com/advisories/GHSA-9g9p-9gw9-jx7f) | High | Next.js DoS via Image Optimizer `remotePatterns`. This app does not configure `remotePatterns`, making the attack surface unreachable. Fix requires upgrading to Next.js 15 (breaking). Tracked for the next major upgrade. |
