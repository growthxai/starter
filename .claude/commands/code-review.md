---
description: Perform comprehensive code review before pushing
allowed-tools: Read, Glob, Grep, Bash(git diff:*), Bash(git log:*)
---

Perform a comprehensive code review of the current branch changes.

## Instructions

1. **Read ALL guideline files** — these are the review standards:
   - @CLAUDE.md
   - All `*.md` files under `.claude/rules/` (use Glob to discover them)

2. **Get the diff**: Run `git diff main...HEAD`

3. **Review against these checklists:**

### Rails Backend

- [ ] Rich domain models, no service objects or interactors
- [ ] Controllers use only 7 standard actions (extract custom actions to resources)
- [ ] Jbuilder views for all Inertia props (no inline `props:`)
- [ ] Concerns follow self-contained pattern with `included` block
- [ ] State modeled as records, not booleans
- [ ] Enum `prefix:`/`suffix:` instead of manual predicates
- [ ] Backslash continuation for multi-arg method calls
- [ ] `if/else` over guard clauses for branching
- [ ] Migrations include indexes for foreign keys
- [ ] `includes` used to prevent N+1 queries
- [ ] `touch: true` on belongs_to for cache invalidation

### React Frontend

- [ ] All files use kebab-case naming (including folders)
- [ ] Resource-based architecture (mirrors Rails controllers, not abstract features)
- [ ] No modifications to `/components/ui/` (Shadcn defaults)
- [ ] No unnecessary `useEffect` (compute during render, use event handlers)
- [ ] `<Form>` component used for simple forms (not `useForm`)
- [ ] TypeScript strict — no `any` types
- [ ] Semantic colors used (not hard-coded grays)
- [ ] `trackError()` instead of `console.error()`

### Testing

- [ ] Tests cover business logic, not framework features
- [ ] Controller tests are integration tests (`ActionDispatch::IntegrationTest`)
- [ ] Fixtures used, not factories
- [ ] `as: :json` for POST/PATCH params
- [ ] `assert_difference` / `assert_no_difference` for create/destroy

### General

- [ ] No scope creep — changes match the stated goal
- [ ] No security vulnerabilities (SQL injection, XSS, command injection)
- [ ] No secrets or credentials in the diff

4. **Report findings** in this format:

```
## Code Review Summary

### ✅ Good
- [What follows conventions well]

### ⚠️ Suggestions
- [file:line] — [issue and suggested fix]

### 🚫 Must Fix
- [file:line] — [critical issue that must be addressed]
```
