---
title: "refactor: Modularize Pi extensions into focused, independently installable packages"
type: refactor
status: completed
date: 2026-04-06
---

# Modularize Pi extensions into focused, independently installable packages

## Overview

The current Pi compatibility extension (`compound-engineering-compat.ts`) bundles four distinct tools into a single extension. This creates unnecessary coupling and prevents users from selectively enabling features. This plan splits the monolithic extension into four focused extensions with clear boundaries.

## Problem Frame

Users of the compound-engineering plugin on Pi may want:
- Only the core workflow automation (`ask_user_question`) without MCPorter or subagents
- MCPorter integration without subagent orchestration
- Different permission profiles for different tool categories

The current all-or-nothing bundling forces users to install all tools even if they only need a subset, and makes it harder to manage permissions granularly.

## Requirements Trace

- R1. Split the monolithic extension into four independent extensions
- R2. Each extension should be independently installable via the CLI
- R3. Preserve backward compatibility — installing `compound-engineering` should still work
- R4. Each extension should have clear, focused documentation
- R5. Extension names should follow a consistent naming convention
- R6. The converter should support generating one, some, or all extensions

## Scope Boundaries

- This refactor only affects Pi extension packaging and installation
- It does not change the underlying tool implementations
- It does not affect Claude Code, Codex, or other platform outputs
- We will not add new tool functionality in this refactor

## Context & Research

### Current Tool Inventory

The `compound-engineering-compat.ts` currently registers these tools:

1. **ask_user_question** — Interactive question/choice prompt for agents
2. **subagent** — Spawn Pi subagent tasks (single, parallel, chain modes)
3. **mcporter_list** — List MCP server tools via MCPorter
4. **mcporter_call** — Call MCP server tools via MCPorter

### Relevant Code Patterns

- Extension files live in `src/templates/pi/`
- Extension source is TypeScript that exports a default function
- Extensions use the Pi `ExtensionAPI` interface
- The CLI template system uses string interpolation for generation

### Tool Dependencies

- **ask_user_question**: No external dependencies, uses `ctx.ui` from Pi
- **subagent**: Calls `pi --no-session` via shell, needs Pi in PATH
- **mcporter_list/call**: Calls `mcporter` CLI, needs mcporter in PATH + config file

### MCPorter Config Resolution

MCPorter tools have sophisticated config path resolution:
1. Explicit `configPath` parameter
2. Project path: `<cwd>/.pi/compound-engineering/mcporter.json`
3. Global path: `~/.pi/agent/compound-engineering/mcporter.json`
4. Bundled path: `<extension-dir>/../pi-resources/compound-engineering/mcporter.json`

This means MCPorter extensions need to preserve the bundled config distribution logic.

## Key Technical Decisions

### Extension Naming Convention

Use a `compound-engineering-` prefix for all extensions to:
- Clearly identify ownership/provenance
- Allow users to discover related extensions via `pi extensions list | grep compound`
- Prevent namespace collisions with other plugin providers

**Proposed names:**
- `compound-engineering-ui` — ask_user_question
- `compound-engineering-subagent` — subagent orchestration
- `compound-engineering-mcporter` — mcporter_list + mcporter_call
- `compound-engineering-compat` — meta-extension that installs all three above (for backward compat)

### Backward Compatibility Strategy

Users who ran `pi install compound-engineering` or `bun compound convert --to pi --install` expect a working setup. We preserve this by:

1. Keeping `compound-engineering-compat.ts` as a meta-extension that re-exports all tools
2. Updating the CLI to install `compound-engineering-compat` by default
3. Allowing users to opt into modular installation via `--extensions ui,subagent` flag

### Installation Modes

The CLI should support three installation patterns:

**Mode 1: Default (all tools, backward compatible)**
```bash
bun compound convert --to pi --install
# Installs: compound-engineering-compat (which includes all tools)
```

**Mode 2: Selective installation**
```bash
bun compound convert --to pi --install --extensions ui,mcporter
# Installs: compound-engineering-ui, compound-engineering-mcporter
```

**Mode 3: Individual extension installation**
```bash
pi install compound-engineering-subagent
# Installs: just the subagent tool
```

### Extension File Structure

Each extension should be:
- Self-contained TypeScript file
- Export default function accepting `ExtensionAPI`
- Include all necessary imports and helper functions
- Include tool-specific config resolution (for MCPorter)

## Open Questions

### Resolved During Planning

**Q: Should we keep the monolithic extension at all?**
A: Yes, as `compound-engineering-compat` for backward compatibility. New users can opt into modular.

**Q: Do we need to version extensions separately?**
A: No. Extensions ship with the plugin. Version number comes from plugin.json. All extensions share the same version for simplicity.

**Q: Should subagent tool be split further (single vs parallel vs chain)?**
A: No. Those are execution modes of one conceptual tool. Keep them together.

**Q: Should ask_user_question live in a generic "UI tools" extension or CE-specific?**
A: Keep CE-prefixed for now. If other plugins want it, we can extract to `@pi/ui-tools` later.

### Deferred to Implementation

- Exact error message text when MCPorter binary is not found
- Whether to add `--list-extensions` flag to CLI (nice to have, not blocking)

## Implementation Units

- [x] **Unit 1: Extract UI extension**

**Goal:** Create `compound-engineering-ui.ts` with `ask_user_question` tool

**Requirements:** R1, R4

**Dependencies:** None

**Files:**
- Create: `src/templates/pi/compound-engineering-ui.ts`
- Modify: None (new file)
- Test: `tests/pi-extensions.test.ts` (new test file)

**Approach:**
- Copy the shared helper functions (truncate, shellEscape if needed)
- Extract only the `ask_user_question` tool registration
- Add JSDoc comment at top explaining the extension's purpose
- Keep the extension lightweight (~100 lines)

**Patterns to follow:**
- Use same ExtensionAPI import structure as `compat-extension.ts`
- Use Type.Object schema from typebox like existing tools
- Return same `{ content, details, isError }` structure

**Test scenarios:**
- Happy path: Extension exports valid default function
- Happy path: Tool schema matches expected structure (question string, optional options array)
- Happy path: Generated file compiles without TypeScript errors

**Verification:**
- Generated extension file is valid TypeScript
- Extension can be imported and called with mock ExtensionAPI
- Tool registration includes correct name, description, parameters schema

---

- [x] **Unit 2: Extract Subagent extension**

**Goal:** Create `compound-engineering-subagent.ts` with `subagent` tool and all execution modes

**Requirements:** R1, R4

**Dependencies:** Unit 1 (for shared pattern)

**Files:**
- Create: `src/templates/pi/compound-engineering-subagent.ts`
- Modify: None
- Test: `tests/pi-extensions.test.ts`

**Approach:**
- Extract all subagent-related helper functions:
  - `normalizeName`
  - `shellEscape`
  - `truncate`
  - `resolveTaskCwd`
  - `runSingleSubagent`
  - `runParallelSubagents`
  - `formatSubagentSummary`
- Include the `SubagentTask` and `SubagentResult` types
- Keep all three modes (single, parallel, chain) in one tool
- Set `DEFAULT_SUBAGENT_TIMEOUT_MS` and `MAX_PARALLEL_SUBAGENTS` constants

**Patterns to follow:**
- Same as Unit 1 for structure
- Keep the complex mode detection logic (`modeCount` check)
- Preserve timeout and concurrency controls

**Test scenarios:**
- Happy path: Extension exports valid default function
- Happy path: Single mode task schema includes agent, task, optional cwd
- Happy path: Parallel mode includes tasks array
- Happy path: Chain mode includes chain array with {previous} support
- Edge case: Mode validation logic rejects multiple modes
- Edge case: Mode validation logic rejects zero modes

**Verification:**
- Generated extension contains all three execution modes
- Helper functions are self-contained (no external imports beyond Pi API)
- TypeScript compiles without errors
- Tool parameters correctly require exactly one mode

---

- [x] **Unit 3: Extract MCPorter extension**

**Goal:** Create `compound-engineering-mcporter.ts` with both `mcporter_list` and `mcporter_call` tools, including config resolution

**Requirements:** R1, R4

**Dependencies:** Unit 1 (for shared pattern)

**Files:**
- Create: `src/templates/pi/compound-engineering-mcporter.ts`
- Modify: None
- Test: `tests/pi-extensions.test.ts`

**Approach:**
- Extract MCPorter-specific helpers:
  - `resolveBundledMcporterConfigPath`
  - `resolveMcporterConfigPath`
  - `truncate` (shared with subagent, duplicate is fine)
- Include both `mcporter_list` and `mcporter_call` tools in one extension
- Preserve the config path resolution waterfall (explicit > project > global > bundled)
- Keep the `--config` flag passing logic

**Patterns to follow:**
- Same extension structure as Units 1-2
- Config path resolution is complex; preserve exact logic including bundled path detection
- Use `pi.exec("mcporter", args, { signal })` pattern

**Test scenarios:**
- Happy path: Extension exports valid default function
- Happy path: `mcporter_list` tool includes server parameter
- Happy path: `mcporter_call` tool supports both call string and server+tool+args modes
- Happy path: Config resolution prefers explicit path when provided
- Integration: Config resolution falls back through the waterfall correctly

**Verification:**
- Generated extension includes both MCPorter tools
- Config resolution logic is intact
- Extension compiles and type-checks
- Config path parameter is optional in both tools

---

- [x] **Unit 4: Create meta-compatibility extension**

**Goal:** Create `compound-engineering-compat.ts` that re-exports all three extensions for backward compatibility

**Requirements:** R1, R3

**Dependencies:** Units 1, 2, 3

**Files:**
- Create: `src/templates/pi/compound-engineering-compat.ts`
- Modify: None
- Test: `tests/pi-extensions.test.ts`

**Approach:**
- Import and re-register all tools from the three focused extensions
- Add a comment explaining this is the "batteries-included" bundle
- Keep it thin — just composition, no new tool logic
- This becomes the new default for `--install` without `--extensions` flag

**Technical design:**

```typescript
// This is directional guidance, not implementation specification
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import uiExtension from "./compound-engineering-ui.ts"
import subagentExtension from "./compound-engineering-subagent.ts"
import mcporterExtension from "./compound-engineering-mcporter.ts"

export default function (pi: ExtensionAPI) {
  uiExtension(pi)
  subagentExtension(pi)
  mcporterExtension(pi)
}
```

**Patterns to follow:**
- Minimalist composition pattern
- No duplication of tool logic
- Standard ExtensionAPI signature

**Test scenarios:**
- Happy path: Meta extension imports all three focused extensions
- Happy path: Meta extension re-registers all four tools (ask_user_question, subagent, mcporter_list, mcporter_call)
- Happy path: Generated extension compiles without circular dependencies

**Verification:**
- Extension successfully composes all three focused extensions
- No tool logic is duplicated
- TypeScript compiles cleanly
- Installing the meta extension provides all four tools

---

- [x] **Unit 5: Update CLI to support selective extension generation**

**Goal:** Add `--extensions <list>` flag to CLI for selective extension generation and installation

**Requirements:** R2, R6

**Dependencies:** Units 1-4

**Files:**
- Modify: `src/commands/convert.ts` (or wherever install logic lives)
- Modify: `src/writers/pi.ts` (extension writing logic)
- Test: `tests/cli.test.ts`

**Approach:**
- Add `--extensions` option to the install/convert command
- Accept comma-separated list: `ui`, `subagent`, `mcporter`, `compat`
- Default to `compat` when flag is omitted (backward compatible)
- Validate extension names against known set
- Generate only the requested extension files
- Update installation to copy only requested extensions

**Patterns to follow:**
- CLI flag parsing pattern from existing codebase
- Extension writing pattern from `src/writers/pi.ts`

**Test scenarios:**
- Happy path: `--extensions compat` generates and installs the meta extension
- Happy path: `--extensions ui,mcporter` generates only those two extensions
- Happy path: Omitting `--extensions` defaults to `compat`
- Edge case: `--extensions unknown` shows helpful error with valid options
- Edge case: `--extensions ui,ui` deduplicates and generates one ui extension

**Verification:**
- CLI accepts `--extensions` flag
- Generated extension files match requested set
- Default behavior (no flag) matches current behavior (all tools)
- Installation copies only requested extensions to Pi extensions directory

---

- [x] **Unit 6: Update documentation**

**Goal:** Document the new modular extension system in README and CLI help text

**Requirements:** R4

**Dependencies:** Unit 5

**Files:**
- Modify: `README.md`
- Modify: `plugins/compound-engineering/README.md`
- Modify: CLI help text (command description)

**Approach:**
- Add "Pi Extensions" section to main README explaining the four extensions
- Document the `--extensions` flag in CLI usage
- Add examples of selective installation
- Create a table showing which tools are in which extension
- Add troubleshooting notes for MCPorter config resolution

**Patterns to follow:**
- Existing README structure and tone
- CLI help text format from other commands

**Test scenarios:**
- Manual: README clearly explains the four extensions and their purposes
- Manual: CLI help text shows `--extensions` option with valid choices
- Manual: Examples are copy-pasteable and correct

**Verification:**
- README includes extension table
- CLI help is updated
- Documentation provides clear installation guidance for both default and selective modes

---

## System-Wide Impact

**Interaction graph:**
- CLI commands now affect which extension files are generated
- Extension files are independent; no cross-extension dependencies
- Pi's extension loader treats each as a separate registration unit

**Error propagation:**
- If MCPorter binary is missing, only MCPorter extension fails (not all tools)
- If subagent invocation fails, only that tool reports error (UI tools still work)

**State lifecycle risks:**
- No shared state between extensions
- Each tool manages its own execution context

**API surface parity:**
- Current `compound-engineering-compat.ts` is replaced but behavior is identical when installed
- Users who install modularly get same tool names, schemas, and behavior

**Unchanged invariants:**
- Tool names (`ask_user_question`, `subagent`, `mcporter_list`, `mcporter_call`) do not change
- Tool schemas and return types do not change
- MCPorter config resolution logic does not change
- Subagent execution modes (single/parallel/chain) do not change

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Breaking existing Pi installations | Keep `compat` extension as default; existing users are unaffected |
| Confusion about which extension to install | Clear documentation and helpful CLI validation messages |
| Duplicate helper functions across extensions | Acceptable tradeoff for independence; helpers are small (~10-30 lines each) |
| MCPorter bundled config path breaks | Test bundled path resolution explicitly; include config in extension directory |

## Documentation / Operational Notes

**Rollout considerations:**
- Announce modular extensions in changelog
- Existing users can keep using `compat` extension
- New users encouraged to install selectively via blog post / docs

**Migration path for existing users:**
1. No action required — `compat` extension preserves current behavior
2. Optional: Uninstall `compat`, install only needed extensions for cleaner setup

**Monitoring:**
- Track which extensions are most commonly installed (if we add telemetry later)
- Watch for GitHub issues about extension confusion

## Sources & References

- Current extension implementation: `src/templates/pi/compat-extension.ts`
- Pi ExtensionAPI docs: Pi README (assumed; verify during implementation)
- Related: CLI conversion logic in `src/commands/convert.ts`
