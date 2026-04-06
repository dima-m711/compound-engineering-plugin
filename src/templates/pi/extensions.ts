/**
 * Pi Extension Source Templates
 * 
 * Contains TypeScript source code for all Compound Engineering Pi extensions.
 * These are exported as string constants to be written to disk during conversion.
 */

import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read extension source files
export const PI_UI_EXTENSION_SOURCE = readFileSync(
  path.join(__dirname, "compound-engineering-ui.ts"),
  "utf-8"
)

export const PI_SUBAGENT_EXTENSION_SOURCE = readFileSync(
  path.join(__dirname, "compound-engineering-subagent.ts"),
  "utf-8"
)

export const PI_MCPORTER_EXTENSION_SOURCE = readFileSync(
  path.join(__dirname, "compound-engineering-mcporter.ts"),
  "utf-8"
)

export const PI_COMPAT_EXTENSION_SOURCE = readFileSync(
  path.join(__dirname, "compound-engineering-compat.ts"),
  "utf-8"
)

// Re-export for backward compatibility
export { PI_COMPAT_EXTENSION_SOURCE as PI_COMPAT_EXTENSION_SOURCE_LEGACY }

export type PiExtensionName = "ui" | "subagent" | "mcporter" | "compat"

export const PI_EXTENSION_METADATA: Record<PiExtensionName, { filename: string; source: string; description: string }> = {
  ui: {
    filename: "compound-engineering-ui.ts",
    source: PI_UI_EXTENSION_SOURCE,
    description: "Interactive question/choice prompts (ask_user_question)",
  },
  subagent: {
    filename: "compound-engineering-subagent.ts",
    source: PI_SUBAGENT_EXTENSION_SOURCE,
    description: "Subagent orchestration (single/parallel/chain modes)",
  },
  mcporter: {
    filename: "compound-engineering-mcporter.ts",
    source: PI_MCPORTER_EXTENSION_SOURCE,
    description: "MCP server integration (mcporter_list, mcporter_call)",
  },
  compat: {
    filename: "compound-engineering-compat.ts",
    source: PI_COMPAT_EXTENSION_SOURCE,
    description: "Meta-extension bundling all tools (backward compatible)",
  },
}
