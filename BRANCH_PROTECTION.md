# Branch Protection Setup

## GitHub Branch Protection Rules

Before your team starts working, configure these branch protection rules for `main`:

### 🔒 Required Steps (GitHub Settings)

1. **Navigate to Settings**
   - Go to: `https://github.com/CiaranMcDonaldCS/resova-intelligence-v3/settings/branches`

2. **Add Branch Protection Rule**
   - Branch name pattern: `main`
   - Click "Add rule"

### ✅ Recommended Settings

#### Protect Matching Branches

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1** (increase to 2 for critical changes)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (optional, if you set up CODEOWNERS)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Status checks to require (add after CI/CD setup):
    - `build` - TypeScript compilation
    - `test` - Unit tests
    - `lint` - Code linting

- ✅ **Require conversation resolution before merging**
  - All PR comments must be resolved

- ✅ **Require signed commits** (optional, but recommended for security)

- ✅ **Require linear history**
  - Prevents merge commits, enforces squash or rebase

- ✅ **Include administrators**
  - Apply rules even to repository admins

#### Rules Applied to Everyone

- ✅ **Allow force pushes: No one**
  - Prevents force pushing to `main`

- ✅ **Allow deletions: Disabled**
  - Prevents accidental deletion of `main` branch

### 📝 Additional Configurations

#### CODEOWNERS File (Optional)

Create `.github/CODEOWNERS` to auto-assign reviewers:

```
# Default owners for everything
* @your-username

# Storage layer
/app/lib/storage/ @storage-team-lead

# AI services
/app/lib/services/ @ai-team-lead

# Components
/app/components/ @frontend-team-lead

# Documentation
*.md @documentation-team
```

#### Status Checks (CI/CD)

Set up GitHub Actions to run automatically on PRs:

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
```

---

## Team Workflow with Protection

### Developer Workflow

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/account-setup

# 2. Make changes and commit
git add .
git commit -m "feat: Add account setup component"

# 3. Push to remote
git push -u origin feature/account-setup

# 4. Create PR on GitHub
# Branch protection will:
# - Require 1+ approvals
# - Run status checks (build, test, lint)
# - Prevent direct merge to main
# - Require conversation resolution

# 5. After approval and checks pass
# - Use "Squash and merge" on GitHub
# - Delete feature branch
```

### Emergency Hotfix Workflow

For critical production issues:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix the issue
git add .
git commit -m "fix: Resolve critical production bug"

# 3. Push and create PR
git push -u origin hotfix/critical-bug

# 4. Request expedited review
# - Label PR with "priority: critical"
# - Tag reviewers directly
# - Fast-track through required checks

# 5. After approval, merge immediately
# - Squash and merge
# - Deploy to production
# - Monitor for issues
```

---

## Review Assignment Strategy

### Manual Assignment
Assign reviewers based on expertise:
- **Storage changes** → @storage-expert
- **AI/ML changes** → @ai-expert
- **UI changes** → @frontend-expert
- **API changes** → @backend-expert

### Auto-Assignment (with CODEOWNERS)
GitHub automatically assigns based on file paths.

### Round-Robin
Distribute reviews evenly across team:
- Use GitHub's "Auto-assign reviewers" feature
- Set up rotation schedule

---

## Merge Strategies

### Squash and Merge (Recommended for Features)

**Use when:**
- Feature branches with many small commits
- Want clean, linear history
- Commit messages are messy

**Result:**
```
main: A --- B --- C (feature squashed)
```

**Command:**
```bash
# On GitHub: Click "Squash and merge"
# Locally equivalent:
git merge --squash feature/my-feature
git commit -m "feat: Complete feature description"
```

### Rebase and Merge (Alternative)

**Use when:**
- Want to preserve individual commits
- Commits are well-structured and meaningful
- Linear history desired

**Result:**
```
main: A --- B --- C1 --- C2 --- C3
```

### Create Merge Commit (Avoid for Features)

**Use when:**
- Release branches
- Tracking branch history is important

**Result:**
```
main: A --- B --- M (merge commit)
                  / \
feature:         C1--C2--C3
```

---

## PR Size Guidelines

### Small PRs (Preferred)
- **Lines changed**: < 400
- **Files changed**: < 10
- **Review time**: 15-30 minutes

### Medium PRs
- **Lines changed**: 400-800
- **Files changed**: 10-20
- **Review time**: 30-60 minutes

### Large PRs (Avoid)
- **Lines changed**: > 800
- **Files changed**: > 20
- **Review time**: 1-2 hours
- **Action**: Split into smaller PRs

### Tips for Smaller PRs
1. Break features into logical chunks
2. Submit infrastructure changes separately
3. Use feature flags for incremental releases
4. Create "Part 1", "Part 2" PRs if needed

---

## Review Checklist for Team

### Code Quality
- [ ] Code follows project style guide
- [ ] No TypeScript `any` types in public APIs
- [ ] Proper error handling
- [ ] No console.logs left in code
- [ ] Comments explain "why", not "what"

### Functionality
- [ ] Code does what PR description says
- [ ] Edge cases handled
- [ ] No breaking changes (or properly documented)
- [ ] Backwards compatible

### Testing
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed
- [ ] No obvious bugs

### Documentation
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Comments added for complex logic
- [ ] Migration guide (if breaking changes)

### Security
- [ ] No hardcoded secrets or API keys
- [ ] Input validation present
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

---

## Emergency Bypass Process

**Only for critical production issues:**

1. **Contact team lead** for approval
2. **Create hotfix branch** from main
3. **Fix issue** with minimal changes
4. **Request expedited review** (1 reviewer, 30 min SLA)
5. **Merge after single approval**
6. **Monitor deployment** closely
7. **Document incident** in post-mortem

**Note:** Even in emergencies, branch protection requires at least 1 approval. Plan accordingly.

---

## Monitoring PR Health

### Metrics to Track

- **Time to first review**: Target < 4 hours
- **Time to merge**: Target < 24 hours for small PRs
- **Review iterations**: Target < 3 back-and-forths
- **PR size**: Target < 400 lines changed

### Tools

- **GitHub Insights**: Track PR metrics
- **Pull Panda / Pull Reminder**: Slack notifications for pending reviews
- **Linear / Jira integration**: Link PRs to tickets

---

## Common Issues & Solutions

### Issue: PR stuck waiting for review
**Solution:**
- Tag specific reviewers in comments
- Post in team Slack channel
- Check if reviewers are on vacation

### Issue: Status checks failing
**Solution:**
- Check GitHub Actions logs
- Run checks locally: `npm run build && npm test`
- Fix issues and push new commit

### Issue: Merge conflicts
**Solution:**
```bash
# Update your branch with main
git checkout feature/my-feature
git fetch origin
git rebase origin/main

# Resolve conflicts
# ... fix conflicts in editor ...

git add .
git rebase --continue
git push -f origin feature/my-feature
```

### Issue: Branch protection blocking admin
**Solution:**
- Don't bypass protection (even as admin)
- Create PR and get proper review
- If absolutely necessary, temporarily disable protection, merge, re-enable

---

## Quick Reference

| Scenario | Branch Type | Merge Strategy | Approvals |
|----------|-------------|----------------|-----------|
| New feature | `feature/*` | Squash and merge | 1-2 |
| Bug fix | `fix/*` | Squash and merge | 1 |
| Hotfix | `hotfix/*` | Squash and merge | 1 (expedited) |
| Documentation | `docs/*` | Squash and merge | 1 |
| Refactoring | `refactor/*` | Squash and merge | 2 |
| Release | `release/*` | Create merge commit | 2 |

---

**Last Updated:** 2025-11-15
