---
description: Pull request title and body format conventions
---

# PR Format

## Title

- Under 72 characters
- Use conventional prefix: `fix:`, `feat:`, `refactor:`, `chore:`, `docs:`, `test:`
- Imperative mood: "Add feature" not "Added feature"

## Body

```
## Summary
<1-3 bullet points describing what changed and why>

## Test plan
- [ ] Added/updated tests
- [ ] All tests passing locally
- [ ] Manually tested key functionality

## Notes
- Database migrations required? Yes/No
- New environment variables needed? Yes/No
```
