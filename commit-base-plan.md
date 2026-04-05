# Planning

You are planning the next steps. Follow a systematic approach: understand the specs and the codebase deeply, think from first principles and don't assume stuff - check it.

## Core Principles

- **Plan commits, not tasks:** Commit is the unit of work. Each commit has to be as small as possible while adding value and passing quality gates.
- **Plan atomic commits with validation:** A commit is atomic only if it passes the pre spcified quality gates,
- **Plan commits that add value:** Each commit should add value to the project, either to the functionality of the end user, to the developers or to the architecture. Partial work doesn't add value.
- **Plan with validation first in mind:** A validation first approach, is a generalization of tests first approach. It means that before deciding how you implement something, you have to decide how you're going to validate you're doing a good work.
    - For new functionality, we must write the tests first. A commit is a RED-GREEN cycle.
    - For small tidys (Tidy First, by Kent Beck) we should pass the existing tests.
    - For infra we should write infra tests first -> RED-GREEN cycle.
    - For other tasks, use CLI, MCP tools and LLM as a judge (with clear binary rubric) to define the RED-GREEN workflow.
- **Each commit goes through a vertical slice** - A commit can touch only one vertical slice and should be complete, unless it's bug fixing, refactoring or tidying. Never split new behavior into horizontal slices. (Code that fits in your head by Mark Seemann)
- **Look for tidies:** Follow Tidy First by Kent Beck to come up with tidy opportunities for micro commits.
- **Use Outside in test first approach:** Use Gherkin for E2E & Integration. Gherkin should be from user perspective, not implementation details. We don't use mocks! Never use mocks!
- **Workstream is a grouping of commits:** A workstream can group multiple commits into a cohesive user journey that goes across vertical slices.
- **Plan only, don't implement:** This is a planning session.
- **If plan exists, plan with incremental updates**: Do not delete implementation plan if exists. If the plan exists, only edit it with incremental updates. Do not delete the file or empty it's contents and create from scratch. Only incremental updates.

---

## Phase 0: Setup

**Goal:** All subsequent phases should be added to a todo.

**Actions:**
1. Understand the requirements
2. Use TODO tool to add all subsequent phases as to do.

**Success Criteria:**
- [] Each phase has it's own line item

---

## Phase 1: Discovery

**Goal:** Understand relevant existing code, specs, changes and patterns at both high and low levels. Ensure the plan follows the template.

**Actions:** 
1. Study `specs/*` with parallel subagents to learn the application specifications.
2. Study @IMPLEMENTATION_PLAN.md (if present) to understand the plan so far.
3. Study the codebase (`internal/*`, `cmd/*`, `container/*`, `features/*`) with parallel subagents.
4. Ensure @IMPLEMENTATION_PLAN.md
    - If implementation plan is empty:
        - Add the template there as a stub. Don't fill it.
    - If implementation plan exists:
        - Make sure it follows the template
        - Add stubs for missing sections, don't fill them.

**Implementation plan template:**
```markdown
# <!-- Title can be updated at later stages -->

## Overview
<!-- Content will be added here in later phases -->

---

## Gap Analysis
<!-- Content will be added here in later phases -->

---

## Workstreams
<!-- Content will be added here in later phases -->
```

Success criteria
- [] You understand relevant existing code, specs, changes and patterns at both high and low levels.
- [] @IMPLEMENTATION_PLAN.md follows the template

---

## Phase 2: Gap Analysis

Goal: Compare existing code against specifications and produce the big picture of the implementation plan.

Actions:
1. Study @IMPLEMENTATION_PLAN.md (if present; it may be incorrect) and use parallel subagents to study existing codebase and compare it against specs/*.
2. Use an Opus subagent to analyze findings, validate the findings and produce the ## Overview and ## Gap Analysis sections, as well as the document title.
    - Ultrathink. Consider searching for TODO, minimal implementations, placeholders, skipped/flaky tests, and inconsistent patterns. Study @IMPLEMENTATION_PLAN.md to determine starting point for research and keep it up to date with items considered complete/incomplete using subagents.
    - Are all gaps addressed?
    - Are there any halucinations in the gaps?

Success criteria:
- [] Document title consistent with findings
- [] ## Overview Consistent with findings
- [] ## Gap Analysis Consistent with findings

---

## Phase 3: Planning Workstreams

Goal: Compare existing code against specifications and produce Workstreams plan.

Workstream planning principles:
- Plan only. Do NOT implement anything.
- Do NOT assume functionality is missing; confirm with code search first.
- A Workstream is a group of commits. While each commit works on a vertical slice, a workstream groups vertical slices into a cross slice functionality
- There are three types of workstreams:
    1. Stabilization: A group of commits that doesn't add functionality from the user perspective. Tidies, refactoring, missing tests...
    2. Refinement: A group of commits that change existing functionality. Commits here, won't necesserily go through the entire vertical slice, since some of the work already exists.
    3. DX: A group of commits that is related to the Developer Experience inside this project. Setting up testing tools, creating scripts, setting CI, infrastructure for the project, etc...
    4. UserJourney: While a commit is a functional behavior for the end user of the app that touches one vertical slice, a UserJourney workstream creates behaviour across multiple vertical slices.
- Do NOT plan the commits inside a workstream, only the workstreams.

Workstreams template:
## Workstreams
```markdown
### Workstream N: [] <!-- Workstream name come here -->

**Type:** <!-- Stabilization|Refinement|DX|UserJourney -->

**Why:**
<!-- Write why we're doing it and how it aligns with the big picture -->

**What:**
<!-- Write what we're doing -->

<!-- Commits go here and would be planned later -->
```

Actions:
1. Study @IMPLEMENTATION_PLAN.md (if present; it may be incorrect) and use parallel subagents to study existing codebase and compare it against specs/*.
2. Use an Opus subagent to analyze findings, prioritize workstreams, add missing workstreams, bundle workstreams, split workstreams and update @IMPLEMENTATION_PLAN.md with the workstreams sorted in priority according to the template.
    - Ultrathink. Consider searching for TODO, minimal implementations, placeholders, skipped/flaky tests, and inconsistent patterns. Study @IMPLEMENTATION_PLAN.md to determine starting point for research and keep it up to date with items considered complete/incomplete using subagents.
    - Do workstreams cover all the gaps? What's the rationale?
    - Do workstreams prioritized correctly? What's the rationale?
    - If new Workstreams are necessary, just add the template without commits.

Success criteria:
- [] Updated the implementation plan with workstreams that complete the gaps between the specs and the codebase

---

## Phase 4: Planning atomic commits

Goal: Compare existing code against specifications and produce a prioritized implementation plan per workstream.

Planning atomic commits principles:
- Plan only. Do NOT implement anything.
- Do NOT assume functionality is missing; confirm with code search first.

Actions:
1. Study @IMPLEMENTATION_PLAN.md (if present; it may be incorrect) and use parallel subagents to study existing codebase and compare it against specs/*.
2. For each workstream:
    1. Use an Opus subagent to analyze findings, prioritize commits, and create/update @IMPLEMENTATION_PLAN.md as a bullet point list sorted in priority of items yet to be implemented.
        - Ultrathink. Consider searching for TODO, minimal implementations, placeholders, skipped/flaky tests, and inconsistent patterns. Study @IMPLEMENTATION_PLAN.md to determine starting point for research and keep it up to date with items considered complete/incomplete using subagents.
        - Do commits follow a logics pattern?
        - Do commits really align with the workstream?
    2. Ultrathink if the commits specified in the plan are atomic indeed, or can be broken done even further.

Atomic commit templates:
```markdown
#### Commit N: [] <!-- Short descriptive title -->

**What:**
<!-- What accomplishes -->

**Why:**
<!-- Why we're doing it and how it aligns -->

**Files touches:**
<!-- List of files that should be touched in this commit -->

**Success Criteria:**
- [] <!-- Specific, verifiable criterion -->
- [] <!-- Another verifiable criteria -->
- [] <!-- Quality Gate passes -->

**Implementation steps:**
1. **RED:**
    - Write Gherkin scenario in `features/[name].feature`:
      <!-- 
      ```gherkin
        Scenario: [Scenario name]
        Given [precondition]
        When [action]
        Then [expected outcome]
      -->
    - ...
    - Run tests, confirm RED state: <!-- [test command] -->
2. **GREEN:**
    - <!-- [imperative instruction] -->
    - <!-- [imperative instruction] -->
    - ...
    - Run tests, confirm GREEN state: <!-- [test command] -->
3. **VALIDATION:**
    - Run quality gate: <!-- [quality gate command] -->
    - ...
    - If passing, mark success criteria as done and commit as done in this file <!-- Hardcoded requirement, don't change -->
    - Commit with the /commit-message skill <!-- Hardcoded requirement, don't change -->

---

#### Commit N: [] Tidy - <!-- Short descriptive title -->

**What:**
<!-- What accomplishes -->

**Why:**
<!-- Why we're doing it and how it aligns -->

**Files touches:**
<!-- List of files that should be touched in this commit -->

**Success Criteria:**
- [] <!-- Specific, verifiable criterion -->
- [] <!-- Another verifiable criteria -->
- [] <!-- Quality Gate passes -->

**Implementation steps:**
1. **Verify GREEN:**
    - Run existing tests: [test command]
    - Confirm all passing
2. **Apply TIDY:**
    - <!-- [imperative instruction] -->
    - <!-- [imperative instruction] -->
    - ...
    - Run tests, confirm GREEN: <!-- [test command] -->
3. **VALIDATION:**
    - Run quality gate: <!-- [quality gate command] -->
    - ...
    - If passing, mark success criteria as done and commit as done in this file <!-- Hardcoded requirement, don't change -->
    - Commit with the /commit-message skill <!-- Hardcoded requirement, don't change -->

---

#### Commit N: [] Infra - <!-- title for Infra commits, Infra commits are commits associated with tooling/libs/frameworks/etc... for the developers of the project. Template condensed to preserve tokens, use the full templte -->

**What:** <!-- ... -->
**Why:** <!-- ... -->
**Files touches:** <!-- ... -->
**Success Criteria:** <!-- ... Infra tests pass, quality gate pass, ...-->

**Implementation steps:**
1. **RED:** <!-- ..., Write infra test, confirm RED, ... -->
2. **GREEN:** <!-- ..., Implement infra, confirm GREEN, ... -->
3. **VALIDATION:** <!-- ..., Quality gate → mark done → Commit with the `/commit-message` skill, ... -->
```
---
Success criteria:
- [] The smallest unit of work that both adds value and passes quality gates
- [] Explains what we're doing
- [] Explains why we're doing it and how it aligns with the big picture
- [] Outlines success criteria of how we know that we did a good job
- [] Defines the files that are going to be touched
- [] Implementation steps
- [] Implementation steps explicitly instruct of how to get to RED state and explicitly instruct to ensure G state.
    - For user facing behavior, you can specify the Gherkin that needs to be written and where.
- [] Implementation steps are highlevel imperative instructions. Contain only high level stuff.
- [] Implementation steps explicitly instruct at the end to check the quality gate, if the quality gate passes it should mark the success criteria as done and commit with a /commit-message skill. (The wording "Commit with the /commit-message skill is required on every commit task).
- [] An atomic commit is complete across a vertical slice

---



## Phase 5: Check yourself

Goal: Double check yourself if you did a good job.

Actions:
1. Reread @IMPLEMENTATION_PLAN.md
1. Reflect with indepth self Socratic questioning on what you did.
2. Answer your self socratic reflection questions
3. Make sure that everything is logical and there are no logical inconsistencies between the gap, workstreams and commits.

Commit structure success criteria:
- [] The smallest unit of work that both adds value and passes quality gates
- [] Explains what we're doing
- [] Explains why we're doing it and how it aligns with the big picture
- [] Outlines success criteria of how we know that we did a good job
- [] Defines the files that are going to be touched
- [] Implementation steps
- [] Implementation steps explicitly instruct of how to get to RED state and explicitly instruct to ensure G state.
    - For user facing behavior, you can specify the Gherkin that needs to be written and where.
- [] Implementation steps are highlevel imperative instructions. Contain only high level stuff.
- [] Implementation steps explicitly instruct at the end to check the quality gate, if the quality gate passes it should mark the success criteria as done and commit with a /commit-message skill. (The wording "Commit with the /commit-message skill is required on every commit task).

---

## Output

Update IMPLEMENTATION_PLAN.md with prioritized tasks. Format as LLM deems most appropriate for this project.

Reference CLAUDE.md for build/test commands and project conventions.
```
