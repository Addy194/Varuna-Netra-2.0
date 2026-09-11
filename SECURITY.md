# Security Policy

Varuna Netra handles authentication tokens, administrator accounts, external API keys and investigation data. Treat repository history and deployment configuration as security-sensitive.

## Never commit secrets

Do not commit:

- JWTs or session tokens
- passwords or test credentials
- API keys (AIS, Resend, Google/OAuth, storage, etc.)
- `.env` files
- private keys/certificates
- generated authentication state
- production database connection strings

Use environment variables or the deployment platform's secret manager. `.env.example` files must contain placeholders only.

## Required remediation for previously committed secrets

A secret that appeared in Git is considered exposed even if the latest file is deleted.

Before final SIH/public release:

1. **Rotate/revoke every exposed credential first.**
2. Remove the affected files from the current branch.
3. Rewrite Git history using `git filter-repo` or BFG so the sensitive blob no longer exists in old commits.
4. Force-push the cleaned history only after coordinating with collaborators.
5. Ask collaborators to re-clone rather than reusing old clones containing the secret.
6. Enable GitHub secret scanning / push protection where available.
7. Verify the public repository by searching for old token/password fragments.

Example history-cleaning pattern (run locally after rotating credentials):

```bash
# install git-filter-repo first
# make a backup clone before running this

git filter-repo --path memory/.tok --invert-paths
```

If a test report also contained credentials, remove that path in the same history-rewrite operation.

## Authentication model

- Guest: read-only session
- Viewer: persistent read-only user
- Analyst/Supervisor: elevated operational roles
- Admin: system/user administration

New public users must never be able to choose an elevated role client-side. Authorization decisions must be enforced by the backend using current database role state.

## Production checklist

- Long random `JWT_SECRET`
- Unique strong administrator password
- `DEMO_MODE=false`
- Explicit `CORS_ORIGINS` / `FRONTEND_URL`
- HTTPS only
- Database not publicly exposed
- Production secrets stored outside Git
- Debug/test accounts removed or disabled
- Demo/test records separated from production records
- Audit log enabled
- Dependency and secret scanning enabled

## Reporting a vulnerability

Do not open a public issue containing credentials, tokens, personal data or exploitable details. Contact the repository owner privately and rotate affected credentials immediately.
