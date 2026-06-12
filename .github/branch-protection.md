# Branch Protection Rules

## Main Branch (`main`)

### Required Settings

1. **Require pull request reviews before merging**
   - At least 1 approval required
   - Dismiss stale reviews when new commits are pushed
   - Require review from Code Owners

2. **Require status checks to pass before merging**
   - TypeScript Compilation (tsc)
   - ESLint
   - Prisma Schema Validation
   - Backend Build
   - Frontend Build
   - Security Scan
   - Dependency Check

3. **Require branches to be up to date**
   - Requires branches to be up to date with the base branch before merging

4. **Restrict who can push to matching branches**
   - Only administrators and code owners

5. **Allow force pushes**
   - Never (blocked)

6. **Allow deletions**
   - Never (blocked)

### Enforcement

These rules are configured via GitHub UI:

```
Settings → Branches → Add rule
Branch name pattern: main
```

### Creating PRs

```bash
git checkout -b feature/my-feature
# ... make changes ...
git push -u origin feature/my-feature
# Create PR via GitHub CLI:
gh pr create --title "feat: my feature" --body "Description"
```

### Recommended Branch Naming

| Prefix | Purpose |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `hotfix/` | Urgent production fixes |
| `release/` | Release preparation |
| `docs/` | Documentation only |
| `chore/` | Maintenance/CI |
