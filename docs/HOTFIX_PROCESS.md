# Hotfix Process

## Severity Definitions

| Severity | Label | Definition | Examples | Response Time |
|---|---|---|---|---|
| **S0** | `critical` | Complete system outage or data loss | Auth broken, DB corrupt, PHI exposed | Immediate |
| **S1** | `high` | Major feature unusable for all users | Payment failures, prescription engine down | < 1 hour |
| **S2** | `medium` | Feature degraded for subset of users | Dashboard slow, notification delay | < 4 hours |
| **S3** | `low` | Cosmetic, edge cases | Wrong button color, typo | Next release |

## Decision: Hotfix vs. Normal Release

```
Is it S0 or S1?
├── YES → Can we fix in < 2 hours?
│   ├── YES → Hotfix process
│   └── NO  → Roll back then fix forward
└── NO  → Normal release process (fix in develop)
```

## Hotfix Branch Procedure

### Step 1: Create Hotfix Branch

From the `main` branch (not `develop`):

```bash
git checkout main
git pull origin main
git checkout -b hotfix/descriptive-name
```

### Step 2: Apply Fix

- Write minimal, focused fix
- Add a regression test if possible
- Do NOT include feature work or refactoring
- Follow the principle: **smallest possible change**

### Step 3: Expedited Review

| Severity | Reviewers | Approval |
|---|---|---|
| S0 | 1 senior engineer | Can self-approve in emergency |
| S1 | 1 senior engineer + 1 reviewer | Must approve |
| S2+ | Normal PR process | Standard review |

### Review Template for Hotfix PRs

```
## Hotfix: [Brief description]

### Severity: S0/S1

### Root Cause
[What broke and why]

### Fix
[What was changed]

### Test Evidence
[ ] Verified locally with production-like data
[ ] Existing tests pass
[ ] New test covers the edge case (if applicable)

### Rollback Plan
[How to revert if this fix causes issues]

### Impact Assessment
[Which users/modules are affected]
```

### Step 4: Deploy

```bash
# Merge to main
git checkout main
git merge hotfix/descriptive-name
git tag v1.0.0-hotfix.1  # or increment PATCH: v1.0.1

# Deploy
# (trigger CD pipeline or manual deploy)

# Merge back to develop
git checkout develop
git merge hotfix/descriptive-name
```

### Step 5: Verification

- [ ] Smoke test the fixed endpoint
- [ ] Verify health check passes: `GET /health`
- [ ] Check Sentry for new errors after deploy
- [ ] Monitor for 30 minutes

## Expedited Deployment

For S0/S1 hotfixes, the standard release checklist is abbreviated:

| Normal | Hotfix |
|---|---|
| Full test suite | Smoke tests only |
| Load testing | Skipped |
| Security scan | Skipped |
| Staging deploy | Deploy directly to staging then prod |
| 2+ reviewers | 1 reviewer (or self-approve for S0) |
| Release notes | Brief message in #engineering |

### Deployment Command (Emergency)

```bash
# Skip CI, deploy directly
git commit --allow-empty -m "[HOTFIX] S0: Description"
git push origin main
# Manually trigger CD pipeline bypassing gates
```

## Post-Mortem

### When Required

- All S0 incidents
- All S1 incidents
- Any hotfix that caused data loss or rollback

### Timeline

| Step | Deadline |
|---|---|
| Initial incident report | Within 24 hours of resolution |
| Root cause analysis | Within 72 hours |
| Action items assigned | Within 1 week |
| Action items completed | Within 2 weeks |

### Post-Mortem Template

```markdown
## Post-Mortem: [Incident Title]

### Incident Date: YYYY-MM-DD
### Severity: S0/S1
### Duration: [Start time] → [End time] (X hours Y minutes)

### Summary
[1-2 paragraph overview]

### Timeline
- [T00:00] Issue detected by [alert/user report]
- [T00:15] On-call engineer acknowledged
- [T00:30] Root cause identified
- [T01:00] Hotfix deployed
- [T01:15] System verified operational

### Root Cause
[What actually caused the issue]

### Resolution
[How it was fixed]

### Impact
- Users affected: [count or percentage]
- Data loss: [yes/no]
- Revenue impact: [$ amount if applicable]

### Action Items
| Action | Owner | Deadline |
|---|---|---|
| [Action 1] | @engineer | YYYY-MM-DD |
| [Action 2] | @engineer | YYYY-MM-DD |

### Prevention
[How will we prevent this from happening again?]
```

## Prevention Measures

| Measure | Description | Owner |
|---|---|---|
| Feature flags | Hotfix can disable feature without deploy | Backend |
| Canary deployments | Roll out to 10% of users first | DevOps |
| Automated rollback | CI/CD auto-rollback on health check failure | DevOps |
| Pre-prod data validation | Catch data issues before they hit prod | QA |
| Circuit breakers | Graceful degradation for dependent services | Backend |

## Communication

| Severity | Channel | Template |
|---|---|---|
| S0 | #incidents (Slack) + PagerDuty call | `[CRITICAL] Service down — investigating` |
| S1 | #incidents (Slack) | `[HIGH] Payment failures — fix in progress` |
| S2 | #engineering (Slack) | `[MEDIUM] Dashboard latency — patching` |
| S0/Resolved | #general + status page | `[RESOLVED] All systems operational` |
