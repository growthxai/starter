# Claude Development Guide

**Philosophy:** Vanilla Rails backend + Simple plain React frontend, connected by Inertia.js.

## Core Principles

- **Rich domain models** over service objects
- **CRUD controllers** over custom actions (7 standard actions only)
- **Concerns** for horizontal code sharing
- **Records as state** over boolean columns
- **Jbuilder for ALL props** — use jbuilder views for Inertia props, never inline `props:`
- **No React Router** — Inertia.js handles all routing
- **Shadcn as Design System** — code in `app/frontend/components/ui` should not be changed
- **Build it yourself** before reaching for gems
- **Plan first** — share work plan before coding complex features
- **TypeScript strict** — avoid `any`, prefer interfaces over types
- **Performance minded** — database indexing, query optimization, jbuilder caching

**Stack:** Rails 8.0 + React 19 + TypeScript + Inertia.js + Vite + shadcn/ui + Tailwind CSS

---

## Quick Reference

| Prefer                                  | Over                                             |
| --------------------------------------- | ------------------------------------------------ |
| Jbuilder views for all Inertia props    | Inline `props:` hash in controllers              |
| Model concerns for business logic       | Service objects, interactors, commands           |
| 7 standard controller actions           | Custom controller actions (extract to resources) |
| `kebab-case.tsx` for frontend files     | `PascalCase.tsx` filenames                       |
| Inertia.js for routing                  | React Router                                     |
| Shadcn components (don't modify `/ui/`) | Custom components when shadcn exists             |
| `if/else` for branching                 | Guard clauses for branching logic                |
| Range syntax `.where(col: val..)`       | Raw SQL for simple comparisons                   |
| Let Rails infer associations            | Redundant `class_name:`, `foreign_key:`          |
| Enum `prefix:`/`suffix:` for predicates | Manual predicate methods                         |
| Fixtures in tests                       | Factory patterns                                 |
| `trackError()` for errors               | `console.error()`                                |
| `yarn` for packages                     | `npm`                                            |
| Plain module when no `included` block   | `ActiveSupport::Concern` without `included`      |
| `<Form>` component for forms            | `useForm` for simple forms                       |
| Backslash continuation for multi-arg    | Parenthesized multi-line method calls            |

---

## Environment & Workflow

**IMPORTANT: Never commit or push changes unless explicitly asked by the user.**

**Package Manager:** Use `yarn` (not npm) for JavaScript packages.

```bash
# Development
bin/dev                              # Start development server
bundle exec rails console            # Rails console
bundle exec rails db:migrate         # Run migrations

# Testing & Quality
bundle exec rails test               # Run all tests
bundle exec rubocop                  # Ruby linting
yarn prettier --check .              # Check formatting
bin/check                            # Run all quality checks

# Database
bin/sync_prod                        # Sync production data (requires DATABASE_URL)
```

### bin/check - Pre-commit Quality Checks

```bash
bin/check
```

Runs: formatting check, test suite, rubocop. Always run before committing.
