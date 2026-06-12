# Secrets Management Report

## Current State

### Environment Variables

WyshCare uses a standard `.env` file approach for local development:

- Backend reads from `.env` via `@nestjs/config` → `ConfigModule.forRoot({ isGlobal: true })`
- No `.env` files are tracked in Git (see `.gitignore` audit below)
- Secrets are accessed at runtime via `process.env.VARIABLE_NAME` or injected via NestJS `ConfigService`

### .gitignore Audit

The root `.gitignore` at `/wyshcare/.gitignore` correctly excludes:

```gitignore
# --- Environment & Secrets ---
.env
.env.*
!.env.example
*.pem
*.key
*.crt
*.p12
*.pfx
*.cer
*.secret
secrets/
```

✅ `.env` files excluded
✅ `.env.*` (e.g., `.env.production`, `.env.staging`) excluded
✅ Certificate/key files excluded
✅ `secrets/` directory excluded
✅ `.env.example` whitelisted (template OK in git)

All sub-project `.gitignore` files (backend, frontend, mobile apps) inherit or replicate these rules.

### Known Secrets Used

| Secret | Source | Used In |
|---|---|---|
| DATABASE_URL | .env | Prisma (PostgreSQL connection) |
| REDIS_URL | .env | Redis connection |
| JWT_SECRET | .env | JWT signing |
| JWT_REFRESH_SECRET | .env | Refresh token signing |
| RAZORPAY_KEY_ID | .env | Payment gateway |
| RAZORPAY_KEY_SECRET | .env | Payment gateway |
| GEMINI_API_KEY | .env | Google AI |
| OPENAI_API_KEY | .env | OpenAI |
| OPENROUTER_API_KEY | .env | OpenRouter AI |
| NVIDIA_NIM_API_KEY | .env | NVIDIA NIM |
| S3_ACCESS_KEY_ID | .env | AWS S3 |
| S3_SECRET_ACCESS_KEY | .env | AWS S3 |
| S3_BUCKET | .env | AWS S3 |
| S3_REGION | .env | AWS S3 |
| RABBITMQ_URL | .env | Message queue |
| SENTRY_DSN | .env | Error tracking |
| LIVEKIT_API_KEY | .env | Video calls |
| LIVEKIT_API_SECRET | .env | Video calls |
| ABDM_CLIENT_ID | .env | ABDM integration |
| ABDM_CLIENT_SECRET | .env | ABDM integration |
| NHCX_API_KEY | .env | Insurance NHCX |
| SMTP_HOST/PASS | .env | Email sending |

## Risks

| Risk | Severity | Current Mitigation |
|---|---|---|
| .env committed to git | High | ✅ .gitignore |
| Secrets in CI/CD logs | High | ❌ No CI/CD audit |
| Secrets in compiled JS bundles | Medium | ❌ Not audited |
| Production secrets in plaintext | Critical | ❌ No secrets manager |
| Key rotation | Medium | ❌ No rotation schedule |
| Secrets in error logs | Medium | ❌ Not audited |

## Production Recommendation

### Primary: Doppler (Recommended)

Doppler is the recommended secrets manager for WyshCare due to:

1. **Workspace/environment separation** — dev, staging, prod in one UI
2. **Integration with NestJS** — native `@nestjs/config` support via Doppler CLI
3. **Audit logging** — every secret access is logged
4. **Rotation** — automated rotation for supported services
5. **CLI-first** — works in CI/CD pipelines without extra tooling

**Alternatives considered:**

| Solution | Cost | Pros | Cons |
|---|---|---|---|
| AWS Secrets Manager | $0.40/secret/month | Native AWS integration | Higher cost at scale |
| HashiCorp Vault | Free (self-hosted) | Full control | Operational overhead |
| Doppler | Free tier (up to 3 projects) | Best DX, audit logs | SaaS dependency |

### Migration Plan

| Phase | Action | Owner |
|---|---|---|
| 1 | Create Doppler workspace and environments (dev, staging, prod) | DevOps |
| 2 | Migrate `.env` values to Doppler secrets | DevOps |
| 3 | Install Doppler CLI in Dockerfile | DevOps |
| 4 | Update NestJS bootstrap to inject Doppler secrets | Backend |
| 5 | Remove `.env` from production Docker image | DevOps |
| 6 | Configure CI/CD integration | DevOps |
| 7 | Add `.env` usage audit to pre-commit hooks | Backend |

## Key Rotation Policy

| Secret Type | Rotation Cadence | Method |
|---|---|---|
| Database passwords | Every 90 days | Supabase console |
| JWT secrets | Every 180 days | Update env + reissue tokens |
| API keys (Razorpay, AI) | Every 180 days | Vendor dashboards |
| S3 credentials | Every 90 days | AWS IAM |
| TLS certificates | Every 365 days | Let's Encrypt / cert-manager |
| ABDM credentials | As required | ABDM gateway |
| Encryption keys (app-level) | Every 365 days | Key management |

### Rotation Process

1. Generate new secret in secrets manager
2. Deploy new secret to staging, verify
3. Deploy to production with zero-downtime
4. Keep old secret active for 24h (grace period)
5. Revoke old secret after grace period
6. Log rotation event in audit trail

## Incident Response: Leaked Secrets

### Severity Levels

| Severity | Example | Response Time |
|---|---|---|
| Critical | Database password in public GitHub | 15 minutes |
| High | API key in logs | 1 hour |
| Medium | JWT secret in internal Slack | 4 hours |
| Low | Expired certificate | 24 hours |

### Response Runbook

```
1. DETECT         → Alert via Sentry / GitHub secret scanning / user report
2. CLASSIFY       → Determine severity (above table)
3. CONTAIN        → Revoke compromised secret immediately
                   → Rotate to new value
                   → If DB: restrict network access, audit queries
4. INVESTIGATE    → Check access logs for unauthorized use
                   → Review Git history for secret exposure
                   → Check CI/CD logs
5. REMEDIATE      → Force password reset for affected users
                   → Reissue tokens if JWT compromised
                   → Notify compliance officer if PHI exposed
6. DOCUMENT       → Write incident report
                   → Add to post-mortem
                   → Update prevention measures
```

### Prevention Measures

- ✅ `.env` in `.gitignore`
- 🔲 Pre-commit hook to detect secrets (e.g., `talisman` or `git-secrets`)
- 🔲 GitHub secret scanning enabled
- 🔲 Secrets never logged in application code
- 🔲 No secrets in Docker image layers
- 🔲 Secrets injected at runtime, not build time
