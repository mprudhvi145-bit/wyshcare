# Release Process

## Versioning

WyshCare follows **Semantic Versioning 2.0.0**:

```
MAJOR.MINOR.PATCH (e.g., 1.2.3)
```

| Component | When to Bump | Example |
|---|---|---|
| **MAJOR** | Breaking API changes, breaking DB schema changes, removal of endpoints | 1.0.0 → 2.0.0 |
| **MINOR** | New features, new endpoints, new DB tables (backward compatible) | 1.0.0 → 1.1.0 |
| **PATCH** | Bug fixes, security patches, performance improvements (no new features) | 1.0.0 → 1.0.1 |

### Pre-release Suffixes

| Suffix | Meaning | Used For |
|---|---|---|
| -alpha.x | Internal/experimental | 1.0.0-alpha.1 |
| -beta.x | External testing | 1.0.0-beta.1 |
| -rc.x | Release candidate | 1.0.0-rc.1 |
| (none) | Stable release | 1.0.0 |

### Version Location

- `backend/package.json` — `version` field
- `frontend/package.json` — `version` field
- Git tag: `v{version}` (e.g., `v1.0.0-alpha.1`)

## Branching Strategy: GitFlow

```
main
  ↑
  └── develop
        ↑
        ├── feature/abdm-consent-flow    ← feature branches
        ├── feature/prescription-pdf
        │     ↓
        │    develop (merge via PR)
        │     ↓
        ├── release/v1.0.0-beta.1        ← release branch
        │     ↓
        │    main (merge via PR, tag)
        │    develop (merge back)
        │
        └── hotfix/critical-db-migration  ← hotfix from main
              ↓
             main (merge via PR, tag)
             develop (merge back)
```

### Branch Descriptions

| Branch | Base | Purpose | Protection |
|---|---|---|---|
| `main` | — | Production-ready code | ✅ Protected, requires PR |
| `develop` | `main` | Integration branch | ✅ Protected, requires PR |
| `feature/*` | `develop` | New features | ❌ Not protected |
| `release/*` | `develop` | Release prep | ❌ Not protected |
| `hotfix/*` | `main` | Urgent production fixes | ❌ Not protected |

## Release Stages

### Stage 1: Alpha (`-alpha.x`)

| Criteria | Details |
|---|---|
| Purpose | Internal testing, demo environments |
| Audience | Core team only |
| Environments | `alpha.wyshcare.com` |
| Testing | Manual smoke tests |
| API stable? | No — breaking changes allowed |
| DB migrations? | Yes, may require reseed |
| Duration | As needed (weeks) |

**Gate check:**
- [ ] Code compiles (`npm run build`)
- [ ] TypeScript typechecks pass
- [ ] Lint passes
- [ ] All module imports valid
- [ ] `.env.example` updated

### Stage 2: Beta (`-beta.x`)

| Criteria | Details |
|---|---|
| Purpose | External testing, feedback collection |
| Audience | Closed beta users, QA team |
| Environments | `beta.wyshcare.com` |
| Testing | Structured QA, integration tests |
| API stable? | Mostly — breaking changes deprecated |
| DB migrations? | Yes, backward compatible only |
| Duration | 2-4 weeks |

**Gate check (all alpha checks plus):**
- [ ] Integration tests pass
- [ ] API documentation (Swagger) published
- [ ] CHANGELOG updated
- [ ] Known issues documented
- [ ] Performance benchmarks baseline captured

### Stage 3: Release Candidate (`-rc.x`)

| Criteria | Details |
|---|---|
| Purpose | Pre-production validation |
| Audience | All stakeholders |
| Environments | `staging.wyshcare.com` |
| Testing | Full regression, load testing, security scan |
| API stable? | Yes — only PATCH releases |
| DB migrations? | Yes, backward compatible only |
| Duration | 1-2 weeks |

**Gate check (all beta checks plus):**
- [ ] E2E tests pass
- [ ] Load test: 1000 concurrent users
- [ ] Security scan: no critical/high findings
- [ ] DR dry run completed
- [ ] Secrets rotated for production
- [ ] All monitoring dashboards configured
- [ ] Rollback procedure tested

### Stage 4: Stable (`x.y.z`)

| Criteria | Details |
|---|---|
| Purpose | Production |
| Audience | All users |
| Environments | `app.wyshcare.com`, `api.wyshcare.com` |
| Testing | All gates passed |
| API stable? | Yes — semver guarantees |
| DB migrations? | Yes, backward compatible only |
| Duration | Indefinite |

## Release Checklist

### 1. Preparation (2-3 days before release)

- [ ] All feature PRs merged to `develop`
- [ ] CHANGELOG.md updated with all changes
- [ ] Version bumped in `package.json` files
- [ ] Release branch created: `release/v{major}.{minor}.{patch}`
- [ ] Release notes drafted

### 2. Staging Deployment

- [ ] Deploy release branch to staging
- [ ] Run full test suite
- [ ] Run E2E tests
- [ ] Review Sentry for new errors
- [ ] Review API response times
- [ ] Verify all third-party integrations (Razorpay, LiveKit, ABDM, etc.)

### 3. Production Deployment

- [ ] PR merged to `main`
- [ ] Git tag created: `git tag v{major}.{minor}.{patch}`
- [ ] Deploy to production (blue-green or rolling)
- [ ] Run smoke tests against production
- [ ] Verify database migrations applied correctly
- [ ] Verify background jobs processing
- [ ] Monitor dashboards for 30 minutes post-deploy

### 4. Post-Release

- [ ] Merge `main` back to `develop`
- [ ] Update project board
- [ ] Send release notes to stakeholders
- [ ] Record any post-release issues

## Rollback Procedure

### When to Roll Back

- Critical bug affecting all users
- Data corruption
- Security vulnerability
- Performance regression >50%
- API contract violation

### Rollback Steps

```bash
# 1. Revert deployment
kubectl rollout undo deployment/wyshcare-backend -n production
kubectl rollout undo deployment/wyshcare-frontend -n production

# 2. Revert database migration (if applicable)
npx prisma migrate down

# 3. Verify rollback
curl -f https://api.wyshcare.com/health

# 4. Communicate
# - Post in #incidents Slack channel
# - Update status page
```

### Rollback Triggers

| Severity | Examples | Action |
|---|---|---|
| Critical | DB data loss, auth broken, PHI exposed | Immediate rollback, no approval needed |
| High | Payment failures, major feature broken | Rollback within 15 min, CTO approval |
| Medium | Non-critical UI bug, minor API issue | Fix forward, no rollback |
