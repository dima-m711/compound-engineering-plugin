---
title: "refactor: Enhance ce-plan with commit-level planning and RED/GREEN structure"
type: refactor
status: completed
date: 2026-04-05
origin: docs/brainstorms/2026-04-05-ce-plan-commit-level-enhancement-requirements.md
---

# refactor: Enhance ce-plan with commit-level planning and RED/GREEN structure

## Overview

`ce-plan` currently produces implementation plans with high-level "implementation units" — roughly commit-sized, but lacking explicit test-type guidance, RED/GREEN structure, and vertical-slice enforcement. This enhancement brings commit-level rigor into `ce-plan` for Standard and Deep plans, while keeping Lightweight plans unchanged.

The core change: each implementation unit can now contain 1-N commits, each with a type (feature / tidy / infra), test-type guidance (Gherkin / existing tests / infra tests), and flexible RED/GREEN/VALIDATION steps when they add clarity. Lightweight plans continue to use high-level units without nesting. A self-check block drawn from `commit-base-plan.md` is integrated into Phase 5.1 to enforce atomicity and vertical-slice compliance.

## Problem Frame

Implementers working from current `ce-plan` output must invent:
- Testing approach (test-first vs implementation-first)
- How to split work (vertical vs horizontal)
- Exact test coverage per unit
- Verification strategy

`commit-base-plan.md` solves this with commit-level specs, but is a separate standalone tool. This plan merges that rigor into `ce-plan`'s existing research pipeline and document structure without disrupting the Lightweight depth level or the skill's core philosophy.

(see origin: `docs/brainstorms/2026-04-05-ce-plan-commit-level-enhancement-requirements.md`)

## Requirements Trace

- R1. Implementation units keep their name and remain the unit of organisation — but each can contain 1-N commits
- R2. Lightweight plans: implementation units stay high-level (no commit-level breakdown)
- R3. Standard/Deep plans: units break into commits when non-trivial (5+ files, multiple concerns, 3+ test scenarios, or natural breaking points)
- R4. Commit-level breakdown happens inline during Phase 3.5 "Define Each Implementation Unit"
- R5. Document-first: `- [ ]` checkboxes in markdown, no forced TODO-tool integration
- R6. Each commit spec includes: What, Why, Files, Success Criteria
- R7. RED/GREEN/VALIDATION steps are flexible — include when they add clarity, skip when obvious
- R8. User-facing behavior commits: Gherkin required in RED step
- R9. Tidy commits: verify GREEN with existing tests before and after
- R10. Infra commits: write infra tests first (RED/GREEN cycle)
- R11. Vertical slice enforcement: commits stay complete across one concern, never split horizontally
- R12. Self-check elements from `commit-base-plan.md` Phase 5 integrated into Phase 5.1
- R13. Self-check covers: atomicity, vertical slice compliance, logical consistency, each commit adds value while passing quality gates
- R14. Template clearly distinguishes implementation unit from commits within it
- R15. Commit specs are concise but complete — enough to execute confidently, no pre-written code
- R16. Output remains portable — no tool-specific executor instructions embedded in plan

## Scope Boundaries

- Do not redesign `ce-brainstorm` or `ce-work`
- Do not force commit-level planning for Lightweight plans
- Do not embed git commands, exact test command recipes, or implementation code in commit specs
- Do not require TODO tool usage
- Do not change the existing research pipeline (repo-research-analyst, learnings-researcher, framework-docs-researcher, deepening agents)

## Context & Research

### Relevant Code and Patterns

- `plugins/compound-engineering/skills/ce-plan/SKILL.md` — primary file to modify
  - Phase 3.5 "Define Each Implementation Unit": add commit decomposition triggers
  - Section 4.2 Core Plan Template: extend implementation unit block with nested commit structure
  - Section 5.1 Review Before Writing: integrate self-check from `commit-base-plan.md`
  - Section 0.6 / Phase 4.1: depth-based gating guidance
- `commit-base-plan.md` — source for commit templates, test-type enforcement, and self-check checklist

### Key Structural Decisions Resolved During Planning

**Markdown structure for nested commits (R14):**
Each implementation unit grows a `### Commits in this Unit` subsection containing `#### Commit N.M` entries (N = unit, M = commit within unit). This is a **Standard/Deep-only structure** — Lightweight units keep the existing flat format.

**Commit decomposition triggers (R3):**
Decompose into multiple commits when a unit:
- Touches 5+ files across different layers (model + controller + view + service + spec)
- Has multiple distinct concerns that can each ship value independently
- Spans 3+ test scenarios with meaningfully different failure modes
- Has a natural tidy / refactor / feature breakpoint within it

**RED/GREEN inclusion triggers (R7):**
- Include explicit substeps for: new feature behavior, complex logic, unfamiliar domain, high-risk paths
- Skip when: simple config change, straightforward refactor with obvious before/after, trivial UI tweak, pure styling

**Self-check additions to Phase 5.1 (R12, R13):**
Currently missing from Phase 5.1:
- Is each commit the smallest unit of work that both adds value and passes quality gates?
- Does each commit cross only one vertical slice (no horizontal splits)?
- Do gap → units → commits form a logically consistent chain?
- Does every commit's Implementation steps lead explicitly through RED then GREEN?
- Does every commit spec close with "Commit with the /commit-message skill"?

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

Changes are scoped to four sections of `plugins/compound-engineering/skills/ce-plan/SKILL.md`:

```
ce-plan/SKILL.md

  Phase 3.5 "Define Each Implementation Unit"
  ├── ADD: Decomposition decision table (when to break → multiple commits)
  ├── ADD: RED/GREEN inclusion triggers
  └── ADD: Commit type vocabulary (feature / tidy / infra)

  Section 4.2 Core Plan Template
  ├── EXTEND: Implementation unit block
  │     Existing fields (Goal, Requirements, Dependencies, Files, ...)
  │     └── ADD "### Commits in this Unit" subsection (Standard/Deep only)
  │           #### Commit N.M: [type] — [title]
  │           **What:** ...
  │           **Why:** ...
  │           **Files:** ...
  │           **Success Criteria:** - [ ] ...
  │           **Implementation steps:**
  │             1. RED: [Gherkin|infra test|n/a]
  │             2. GREEN: [high-level imperative steps]
  │             3. VALIDATION: [quality gate → mark done → /commit-message]
  └── ADD: Conditional note — Lightweight units omit the Commits subsection

  Section 0.6 & Phase 4.1 (Depth guidance)
  └── ADD: Explicit "Lightweight skips commit-level breakdown" callout

  Phase 5.1 Review Before Writing
  └── ADD: Commit-Level Self-Check subsection
        - [ ] Each commit is the smallest value-adding, gate-passing unit
        - [ ] Each commit is a vertical slice (no horizontal splits)
        - [ ] gap → units → commits are logically consistent
        - [ ] Every feature commit has a Gherkin RED step
        - [ ] Every commit closes with "Commit with /commit-message skill"
```

## Implementation Units

---

- [x] **Unit 1: Add commit decomposition triggers and RED/GREEN guidance to Phase 3.5**

**Goal:** Give planners clear decision criteria for when an implementation unit should decompose into multiple commits and when to include explicit RED/GREEN substeps.

**Requirements:** R3, R4, R7, R8, R9, R10, R11

**Dependencies:** None

**Files:**
- Modify: `plugins/compound-engineering/skills/ce-plan/SKILL.md` (Phase 3.5 "Define Each Implementation Unit")

**Approach:**
- After the existing field list in Phase 3.5, add a "Commit decomposition" callout block (Standard/Deep only)
- Include a small decision table: triggers for decomposing + triggers for staying as one commit
- Add a "Commit type guide" paragraph explaining feature / tidy / infra types and their corresponding test expectations
- Add a "RED/GREEN flexibility" note listing include-triggers and skip-triggers
- Keep all additions advisory, not prescriptive — implementer judgment always applies

**Patterns to follow:** Phase 3.5 existing field descriptions (bullet-list style with bold labels); advisory tone matching rest of Phase 3

**Test scenarios:**
- Happy path: A planner working on a Standard plan reads Phase 3.5 and can decide whether their unit needs commit decomposition without guessing
- Edge case: A unit touching 4 files across 2 concerns — guidance should make it clear this is a borderline call left to judgment
- Integration: Updated Phase 3.5 should not conflict with or duplicate Phase 4.1 depth guidance

**Verification:**
- Phase 3.5 contains a decision table for decomposition triggers and a commit-type guide with test-type expectations
- Language is advisory, not mandatory, to preserve implementer judgment

---

- [x] **Unit 2: Extend Section 4.2 Core Plan Template with nested commit structure**

**Goal:** Update the implementation unit template so Standard/Deep plans can express 1-N commit specs nested within each unit, using a clear, readable subsection structure.

**Requirements:** R1, R6, R7, R8, R9, R10, R14, R15, R16

**Dependencies:** Unit 1 (commit type vocabulary and RED/GREEN triggers must be defined first so template can reference them)

**Files:**
- Modify: `plugins/compound-engineering/skills/ce-plan/SKILL.md` (Section 4.2 Core Plan Template, implementation unit block)

**Approach:**
- Append a conditional `### Commits in this Unit` subsection to the implementation unit template block
- Use a comment to indicate it is Standard/Deep-only: `<!-- Standard/Deep only: omit for Lightweight plans -->`
- Define a `#### Commit N.M: [type] — [title]` entry format with fields: What, Why, Files, Success Criteria (checkboxes), Implementation steps (RED / GREEN / VALIDATION)
- RED step: Gherkin for feature commits, infra test for infra commits, omit for tidy commits (just "Verify existing tests GREEN")
- GREEN step: high-level imperative instructions only, no exact code
- VALIDATION step: quality gate → mark success criteria as done → "Commit with the /commit-message skill" (exact wording required)
- Add a condensed "Tidy" and "Infra" commit variant block (mirrors `commit-base-plan.md` condensed templates)

**Patterns to follow:** Existing implementation unit template in Section 4.2; commit templates in `commit-base-plan.md` (adapt away from execution-script framing to plan-document framing)

**Test scenarios:**
- Happy path: A planner writing a Standard plan can fill in the nested commit structure with no ambiguity about field intent or order
- Edge case: A unit with only one commit — the `### Commits in this Unit` subsection contains a single `#### Commit N.1` entry; this should not look awkward
- Edge case: A Lightweight plan — the `### Commits in this Unit` subsection is absent; no structural gap should appear in the document
- Integration: The nested structure renders cleanly in markdown and remains readable in diff view (no deeply nested indentation required)

**Verification:**
- The updated template produces plans where commit boundaries, test expectations, and validation gates are clearly visible
- Tidy and infra commit variants are included as condensed alternative blocks

---

- [x] **Unit 3: Add depth-based gating callout to Section 0.6 and Phase 4.1**

**Goal:** Make it explicit that Lightweight plans skip commit-level breakdown, preventing over-engineering of small work.

**Requirements:** R2

**Dependencies:** None (independent of Units 1-2)

**Files:**
- Modify: `plugins/compound-engineering/skills/ce-plan/SKILL.md` (Section 0.6 Assess Plan Depth, Phase 4.1 Plan Depth Guidance)

**Approach:**
- In Section 0.6, add a one-sentence callout under the Lightweight bullet: "Lightweight plans use high-level implementation units only — commit-level breakdown is not required."
- In Phase 4.1 under the Lightweight subsection, mirror that callout and add: "If the user explicitly requests commit-level detail for a Lightweight plan, it is allowed but optional."
- Keep additions minimal — one sentence each in two places

**Patterns to follow:** Existing depth classification bullets in Section 0.6 and Phase 4.1

**Test scenarios:**
- Happy path: A planner classifying a 3-file change as Lightweight sees clear confirmation to skip commit nesting
- Edge case: User explicitly requests commit-level detail for a small change — guidance permits this without confusion

**Verification:**
- Section 0.6 and Phase 4.1 each contain an explicit callout that Lightweight plans skip commit-level breakdown

---

- [x] **Unit 4: Integrate commit-level self-check into Phase 5.1 Review Before Writing**

**Goal:** Add a commit-level self-check block to the existing review checklist covering atomicity, vertical slice compliance, and logical consistency.

**Requirements:** R12, R13

**Dependencies:** Units 1-2 (commit type vocabulary and template must exist before self-check can reference them)

**Files:**
- Modify: `plugins/compound-engineering/skills/ce-plan/SKILL.md` (Phase 5.1 Review Before Writing)

**Approach:**
- Append a new "Commit-Level Self-Check (Standard/Deep only)" section at the end of Phase 5.1
- Checklist items (each as a bullet, matching the advisory register of the rest of Phase 5.1):
  - Each commit is the smallest unit of work that both adds value and passes quality gates
  - Each commit stays within one vertical slice (no horizontal splits across implementation units)
  - The chain from gap → implementation units → commits is logically consistent with no invented work
  - Every feature commit has a Gherkin scenario in its RED step
  - Every tidy commit opens and closes with an existing-tests GREEN confirmation
  - Every infra commit opens with an infra test (RED before GREEN)
  - Every commit spec closes with "Commit with the /commit-message skill"
- Keep the existing Phase 5.1 items intact — this is additive only

**Patterns to follow:** Existing Phase 5.1 bullet-list review items; advisory register ("Each feature-bearing unit has test scenarios...")

**Test scenarios:**
- Happy path: A planner completing a Standard plan can run through the self-check and catch a horizontal split before writing the plan
- Edge case: A Lightweight plan — the "(Standard/Deep only)" note makes it clear to skip the self-check block

**Verification:**
- Phase 5.1 contains the self-check block with all checklist items listed above
- Existing Phase 5.1 items are unchanged

## System-Wide Impact

- **Interaction graph:** `ce-plan` is consumed by `ce-work` and read by human planners. The nested commit structure is additive — `ce-work` can continue parsing the existing top-level implementation unit fields without breaking. The nested commits provide extra fidelity when the implementer chooses to use them.
- **Error propagation:** N/A — this is a skill (documentation) change, not stateful runtime code.
- **State lifecycle risks:** None. Existing plans remain valid; new plans adopt the enhanced format. No migration needed.
- **API surface parity:** The public contract of `ce-plan` (what it accepts, what it produces) is unchanged. The plan document format gains optional nesting but does not break existing consumers.
- **Unchanged invariants:** The research pipeline (Phase 1), deepening workflow (Phase 5.3), document review (Phase 5.3.8), and post-generation options (Phase 5.4) are untouched.

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Nested commits add cognitive overhead for simple Standard plans | Medium | Low | Decomposition triggers emphasise judgment; "stays as one commit" is always a valid choice |
| RED/GREEN substeps creep into every commit, inflating plan length | Medium | Low | Explicit skip-triggers in Phase 3.5; template note says "include when they add clarity" |
| Self-check elements duplicate existing Phase 5.1 checks | Low | Low | Review existing checks during Unit 4 and remove any exact duplicates |
| Plans become unreadable in diff view due to deep nesting | Low | Medium | Flat-markdown rule: `####` headers, not indented sub-blocks, keep diffs legible |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-05-ce-plan-commit-level-enhancement-requirements.md](docs/brainstorms/2026-04-05-ce-plan-commit-level-enhancement-requirements.md)
- **Commit template source:** [commit-base-plan.md](commit-base-plan.md)
- **Primary file:** [plugins/compound-engineering/skills/ce-plan/SKILL.md](plugins/compound-engineering/skills/ce-plan/SKILL.md)
