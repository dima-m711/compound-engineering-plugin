---
date: 2026-04-05
topic: ce-plan-commit-level-enhancement
---

# Enhance ce-plan with Commit-Level Planning

## Problem Frame

`ce-plan` currently produces implementation plans with high-level "implementation units" that roughly correspond to commits but lack explicit RED/GREEN/VALIDATION structure, test-type guidance, and vertical-slice enforcement. The `commit-base-plan.md` approach demonstrates the value of commit-level rigor — each commit is a self-contained vertical slice with clear RED/GREEN cycles, explicit test scenarios (Gherkin for features, existing tests for tidies, infra tests for infra), and validation gates.

Implementers working from current `ce-plan` output have to invent:
- Testing approach (test-first vs implementation-first)
- How to split work (vertical vs horizontal)
- Exact test coverage expectations
- Verification strategy for each unit

This enhancement brings commit-level rigor into `ce-plan` for Standard and Deep plans, while keeping Lightweight plans high-level.

## Requirements

**Planning Structure**

- R1. Implementation units remain called "implementation units" (not renamed to "workstreams"), but each unit can now contain 1-N commits when the work naturally decomposes that way
- R2. For **Lightweight** plans, implementation units stay high-level (current behavior) — no commit-level breakdown required
- R3. For **Standard** and **Deep** plans, implementation units should break down into commit-level specs when the unit is non-trivial (touching 3+ files, multiple concerns, or spanning multiple test scenarios)
- R4. Commit-level breakdown happens during Phase 3.5 "Define Each Implementation Unit" — inline, not as a separate planning phase
- R5. The plan document remains the primary artifact — no forced TODO tool integration. Use `- [ ]` checkbox syntax for progress tracking in the document itself

**Commit Structure and Testing**

- R6. Each commit spec must include: What, Why, Files, Success Criteria (carried forward from current ce-plan)
- R7. Each commit spec should include RED/GREEN/VALIDATION steps when they add clarity — but flexibility is allowed. Skip explicit substeps when the approach is obvious (e.g., simple config changes, straightforward refactors)
- R8. For all **user-facing behavior** commits, require Gherkin scenarios in the RED step
- R9. For **tidy commits** (Kent Beck style), verify GREEN state with existing tests before and after the tidy
- R10. For **infra commits** (tooling, frameworks, build system), write infra tests first (RED/GREEN cycle for infrastructure)
- R11. Each commit should follow the vertical slice principle — complete across one concern, never split horizontally (no "write all models first, then controllers, then tests")

**Self-Check and Quality**

- R12. Integrate valuable elements from `commit-base-plan.md` Phase 5 self-check into the existing Phase 5.1 "Review Before Writing" checklist
- R13. The self-check should verify: commit atomicity, vertical slice compliance, logical consistency between gap/units/commits, and that each commit adds value while passing quality gates

**Template and Presentation**

- R14. The plan template should clearly distinguish between implementation units and the commits within each unit
- R15. Commit specs should be concise but complete — enough detail to execute confidently without pre-writing implementation code
- R16. The output should remain portable as a document or issue — no tool-specific executor instructions embedded in the plan

## Success Criteria

- A Standard or Deep plan from the enhanced `ce-plan` includes explicit commit-level specs with test-type guidance
- Each commit spec clearly states whether it's feature (Gherkin), tidy (existing tests), or infra (infra tests first)
- Implementers know exactly what to test and how to verify completion without inventing coverage
- Lightweight plans remain unchanged — high-level units without commit breakdown
- The plan document can be read, reviewed, and executed without requiring TODO tool integration
- Commits enforce vertical slicing — no horizontal splits across implementation units

## Scope Boundaries

- Do not redesign `ce-brainstorm` or `ce-work` in this change
- Do not force commit-level planning for Lightweight plans
- Do not embed git commands, exact test command recipes, or implementation code in commit specs
- Do not require TODO tool usage — the plan document is sufficient
- Do not change the existing research pipeline (repo-research-analyst, learnings-researcher, framework-docs-researcher, deepening agents)

## Key Decisions

- **Implementation units keep their name** — no rebranding to "workstreams". The semantic shift (1 unit → 1-N commits) happens internally
- **Depth-based gating** — Lightweight = high-level, Standard/Deep = commit-level when warranted
- **Flexible RED/GREEN** — include explicit substeps when they add clarity, skip when obvious
- **Test-type enforcement** — Gherkin for features, existing tests for tidies, infra tests for infra
- **Document-first handoff** — no forced TODO integration; `- [ ]` checkboxes in markdown are sufficient
- **Inline commit breakdown** — happens in Phase 3.5, not as a separate phase

## Dependencies / Assumptions

- `ce-work` can consume plans with nested commit structure (implementation units containing 1-N commits)
- The existing `ce-plan` template and workflow remain mostly intact — this is an enhancement, not a rewrite
- The `commit-base-plan.md` self-check adds value when integrated into Phase 5.1

## Outstanding Questions

### Deferred to Planning

- [Affects R7, R14][Technical] What is the exact markdown structure for an implementation unit containing multiple commits? Nested bullets, subsections, or another format?
- [Affects R12][Needs research] Which specific elements from `commit-base-plan.md` Phase 5 self-check are not already covered by `ce-plan` Phase 5.1 and should be added?
- [Affects R7][Technical] When should a commit spec include explicit RED/GREEN/VALIDATION substeps vs staying high-level? Define clear triggers.
- [Affects R3][Technical] When should an implementation unit decompose into multiple commits vs staying as one? Define clear triggers (file count, concern count, test scenario count).

## Next Steps

→ `/ce-plan` for structured implementation planning
