# Contributing to Resova Intelligence V3

Thank you for contributing to Resova Intelligence! This guide will help you get started with our development workflow.

## 📋 Table of Contents

- [Development Workflow](#development-workflow)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)

---

## 🔄 Development Workflow

### 1. Create a Feature Branch

Always create a new branch from `main` for your work:

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, well-documented code
- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation as needed

### 3. Commit Your Changes

Follow our [commit message conventions](#commit-messages):

```bash
git add .
git commit -m "feat: Add user authentication system"
```

### 4. Push and Create PR

```bash
git push -u origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 🌳 Branch Naming

Use descriptive branch names that indicate the type and purpose:

### Prefixes

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### Examples

```
feature/account-setup-component
fix/storage-layer-persistence
docs/api-integration-guide
refactor/dashboard-simplification
test/activity-config-validation
chore/update-dependencies
```

---

## 💬 Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, missing semi-colons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `build` - Build system or external dependencies
- `ci` - CI configuration files and scripts
- `chore` - Other changes that don't modify src or test files
- `revert` - Reverts a previous commit

### Examples

```bash
# Feature
git commit -m "feat: Add activity type selection in onboarding"

# Bug fix
git commit -m "fix: Resolve localStorage persistence issue in Safari"

# Documentation
git commit -m "docs: Add API integration examples"

# Detailed commit with body
git commit -m "feat: Implement layered AI prompting system

- Add ConfigData parameter to ClaudeService
- Build activity-specific seed prompts
- Layer prompts: base + activity + analytics
- Update AnalyticsService to load config from storage

Closes #123"
```

---

## 🔀 Pull Request Process

### 1. Before Creating PR

- [ ] All tests pass locally
- [ ] TypeScript compiles without errors
- [ ] Code follows project style guidelines
- [ ] Documentation updated (if needed)
- [ ] No console errors or warnings
- [ ] Self-reviewed your code

### 2. Creating the PR

1. **Title**: Use conventional commit format
   ```
   feat: Add user authentication system
   ```

2. **Description**: Fill out the PR template completely
   - What changes were made?
   - Why were they made?
   - How were they tested?
   - Any screenshots/demos?

3. **Labels**: Add appropriate labels
   - `feature`, `bug`, `documentation`, etc.
   - `breaking-change` if applicable
   - `needs-testing`, `ready-for-review`, etc.

### 3. Review Process

- **At least 1 approval** required before merge
- Address all review comments
- Keep PR up-to-date with `main` branch
- Request re-review after making changes

### 4. Merging

- Use **"Squash and merge"** for feature branches
- Use **"Create a merge commit"** for release branches
- Delete branch after merge (GitHub will prompt)

---

## 📏 Code Standards

### TypeScript

- **No `any` types** in public APIs
- Use explicit return types for functions
- Prefer interfaces over types for objects
- Use strict mode (enabled in tsconfig.json)

```typescript
// ❌ Bad
function processData(data: any) {
  return data.map(item => item.value);
}

// ✅ Good
interface DataItem {
  value: number;
  label: string;
}

function processData(data: DataItem[]): number[] {
  return data.map(item => item.value);
}
```

### React Components

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components focused (single responsibility)
- Use TypeScript for props

```typescript
// ❌ Bad
export default function MyComponent(props) {
  return <div>{props.data}</div>;
}

// ✅ Good
interface MyComponentProps {
  data: string;
  onUpdate?: (value: string) => void;
}

export default function MyComponent({ data, onUpdate }: MyComponentProps) {
  return <div>{data}</div>;
}
```

### File Organization

```
app/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── features/       # Feature-specific components
├── lib/                # Business logic
│   ├── services/       # API services
│   ├── storage/        # Storage layer
│   ├── utils/          # Utility functions
│   └── config/         # Configuration files
├── types/              # TypeScript type definitions
└── api/                # API routes
```

### Naming Conventions

- **Components**: PascalCase (`AccountSetup.tsx`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_TIMEOUT`)
- **Interfaces**: PascalCase with 'I' prefix optional (`UserData` or `IUserData`)
- **Types**: PascalCase (`ActivityType`)

---

## ✅ Testing Requirements

### Unit Tests

All new functions should have unit tests:

```typescript
// Function
export function calculateDiscount(price: number, percent: number): number {
  return price * (percent / 100);
}

// Test
describe('calculateDiscount', () => {
  it('should calculate 10% discount correctly', () => {
    expect(calculateDiscount(100, 10)).toBe(10);
  });

  it('should handle zero discount', () => {
    expect(calculateDiscount(100, 0)).toBe(0);
  });
});
```

### Integration Tests

Test component interactions and API calls:

```typescript
describe('AccountSetup', () => {
  it('should save credentials to storage', async () => {
    render(<AccountSetup />);

    // Fill form
    fireEvent.change(screen.getByLabelText('API Key'), {
      target: { value: 'test-key' }
    });

    // Submit
    fireEvent.click(screen.getByText('Save'));

    // Verify storage
    expect(AuthStorage.load()?.resovaApiKey).toBe('test-key');
  });
});
```

### Manual Testing

Before submitting PR, test:
- ✅ Development mode (`npm run dev`)
- ✅ Production build (`npm run build && npm start`)
- ✅ Multiple browsers (Chrome, Firefox, Safari)
- ✅ Mobile viewport
- ✅ All user flows related to your changes

---

## 🔍 Code Review Guidelines

### As a Reviewer

- **Be constructive**: Suggest improvements, not just criticisms
- **Be specific**: Point to exact lines and explain why
- **Ask questions**: "Why did you choose this approach?"
- **Approve when ready**: Don't hold up good code for nitpicks

### As an Author

- **Respond to all comments**: Even if just to acknowledge
- **Be open to feedback**: Reviewers are helping improve quality
- **Explain your decisions**: Help reviewers understand your approach
- **Request re-review**: After addressing comments

---

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes

### Creating a Release

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release branch: `release/v1.2.3`
4. Create PR to `main`
5. After merge, tag the release: `git tag v1.2.3`
6. Push tag: `git push origin v1.2.3`
7. Create GitHub release with notes

---

## 🐛 Reporting Bugs

Use GitHub Issues with the bug template:

1. **Clear title**: "Storage layer fails in Safari private mode"
2. **Steps to reproduce**: Numbered list
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: Browser, OS, version
6. **Screenshots**: If applicable

---

## 💡 Feature Requests

Use GitHub Issues with the feature template:

1. **Problem statement**: What problem does this solve?
2. **Proposed solution**: How should it work?
3. **Alternatives**: Other approaches considered
4. **Additional context**: Mockups, examples, etc.

---

## 📞 Getting Help

- **Questions**: Use GitHub Discussions
- **Bugs**: Create a GitHub Issue
- **Urgent**: Contact team lead directly
- **Documentation**: Check `/docs` folder first

---

## 🙏 Thank You

Your contributions make Resova Intelligence better for everyone. We appreciate your time and effort!

---

**Happy Coding!** 🎉
