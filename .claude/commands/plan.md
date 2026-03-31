---
description: Create a structured implementation plan with acceptance criteria before coding
argument-hint: <task description or @file-path>
allowed-tools: Read, Glob, Grep, Agent
---

You are creating a structured implementation plan. Do NOT edit any files until the plan is approved.

## Instructions

### Step 1: Explore the codebase

Spawn Explore agents to understand the affected code areas. Never guess at existing patterns — look at the actual code first.

Focus on:

- Existing models, controllers, and views in the affected area
- Similar implementations elsewhere in the codebase
- Current test patterns for the affected area
- Route structure and naming conventions

### Step 2: Produce the plan

Choose the appropriate format based on complexity:

**Lightweight (default — ≤4 files, no migrations):**

1. **Goal** — one paragraph describing the user-visible outcome
2. **Files to change** — for each file: what changes, why
3. **Acceptance criteria** — AC1, AC2, ... (binary pass/fail, testable)
4. **Edge cases** — concrete scenarios that could break the feature
5. **Implementation steps** — ordered TDD sequence (test first, then code)

**Heavy (auto-escalate for 5+ files, migrations, or data changes):**

All of the above, plus:

6. **Assumptions & risks** — each marked [RISK] if uncertain
7. **Out of scope** — explicitly what this does NOT change
8. **Test plan** — maps tests to AC IDs (AC1 → test X, AC2 → test Y)
9. **Rollback plan** — how to revert if something goes wrong
10. **Risk assessment & review guide** — per-part table with risk level (LOW/MEDIUM/HIGH), estimated review time, and review guidance. Include "what to review carefully" and "what can be skimmed" sections. Total review time target: ≤15 minutes for a human reviewer

### Step 3: Wait for approval

Present the plan and wait for the user to approve before implementing.

## Rules

- **Explore first** — never guess at existing patterns
- **No generic language** — ban "improve", "handle properly", "as needed", "clean up"
- **State assumptions** — don't ask, state what you're assuming
- **File-level specificity** — every file change must say what and why
- **Binary acceptance criteria** — every AC must be pass/fail testable
- **TDD order** — implementation steps must be: write failing test → write minimal code to pass → repeat
- **One-shot correctness** — optimize for getting it right the first time
- **Minimal review burden** — the plan should be scannable in under 5 minutes
- **No unasked changes** — only implement what the plan specifies; no refactoring surrounding code, adding comments, or "improving" things outside scope
- **Ask when unclear** — if something is ambiguous or a detail is missing, stop and ask before guessing; do not infer intent
- **Review budget ≤15 min** — total diff across all parts should be reviewable by a human in under 15 minutes; keep diffs small and focused

## Mandatory sections (DO NOT remove when editing plans)

<!-- KEEP: These sections must appear in every generated plan. Do not remove or skip them. -->

The following sections are **required** in every plan and must not be removed during edits:

1. **Risk assessment & review guide** (heavy plans) — per-part risk table, "what to review carefully", "what can be skimmed"
2. **Acceptance criteria** — AC IDs referenced by TDD sequences
