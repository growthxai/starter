---
description: TDD workflow, implementation rules, and verification report template — applies to all coding work
---

# Implementation Discipline

## When implementing code changes

- **TDD red/green cycle:** Write a failing test first, then write the minimal code to make it pass. Never write implementation code without a failing test.
- When working from a plan, restate which acceptance criteria (AC IDs) you're implementing before each file change
- Do not expand scope beyond what was requested
- Do not refactor unrelated code
- Keep diffs minimal — smallest correct change
- If you discover something the plan missed, stop and flag it to the user
- Use specialized agents: rails-developer for backend, front-end-developer for frontend, database-expert for schema/query work

## Test-Fix Loop (mandatory during implementation)

After writing or modifying any code:

1. **Run the relevant tests immediately** — don't batch up multiple changes before testing
   - Backend: `bundle exec rails test <test_file>` (or specific test with `-n test_name`)
   - Frontend: `yarn test <test_file>` (if applicable)
   - Run the specific test file you just wrote/changed, not the full suite
2. **If tests fail:** Read the full error output, diagnose the root cause, fix it, and re-run
   - Do NOT move on to the next AC until the current test passes
   - If stuck after 3 failed attempts at the same error, stop and flag it to the user
3. **If tests pass:** Move on to the next acceptance criterion
4. **Before producing the verification report:** Run the full test suite for the affected area
   - e.g., `bundle exec rails test test/models/` or the full file
   - Record the command and output in the verification report

- **Retry limit:** If the same test fails 3 times with different fixes, stop and ask the user. Something fundamental may be wrong with the approach.

## After implementation — Verification Report (always produce this)

**Summary:** What was implemented. What was intentionally not changed.

**Files changed:**

| File | Reason | Change summary |
| ---- | ------ | -------------- |

**Acceptance criteria status:**

| AC  | Criterion | Status | Evidence |
| --- | --------- | ------ | -------- |

Status must be PASS, FAIL, or NOT PROVEN. Never claim PASS without evidence.

**Tests run:**

| Test command | Result |
| ------------ | ------ |

**Edge cases checked:**

| Edge case | Status | How verified |
| --------- | ------ | ------------ |

**Risks / not proven:** Say NOT PROVEN — never claim unverified success.

**High-risk files requiring review:**

| File | Risk | Why it needs review |
| ---- | ---- | ------------------- |

Rate each file: LOW (routine change), MEDIUM (new logic, edge cases), HIGH (data mutations, security, complex state). Only HIGH and MEDIUM files listed here.

**Manual review guide:** 3-5 specific things to inspect in the high-risk files.
