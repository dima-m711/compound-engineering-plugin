/**
 * Compound Engineering Compatibility Extension for Pi
 * 
 * Meta-extension that bundles all Compound Engineering tools for backward compatibility.
 * 
 * This extension re-exports:
 * - compound-engineering-ui (ask_user_question)
 * - compound-engineering-subagent (subagent orchestration)
 * - compound-engineering-mcporter (mcporter_list, mcporter_call)
 * 
 * Use this extension for the full "batteries-included" experience.
 * For modular installation, install individual extensions instead.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import uiExtension from "./compound-engineering-ui.js"
import subagentExtension from "./compound-engineering-subagent.js"
import mcporterExtension from "./compound-engineering-mcporter.js"

export default function (pi: ExtensionAPI) {
  // Register all tools from the three focused extensions
  uiExtension(pi)
  subagentExtension(pi)
  mcporterExtension(pi)
}
