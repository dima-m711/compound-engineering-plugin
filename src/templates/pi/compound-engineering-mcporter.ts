/**
 * Compound Engineering MCPorter Extension for Pi
 * 
 * Provides MCP (Model Context Protocol) server integration via MCPorter CLI.
 * 
 * Tools:
 * - mcporter_list: List tools on an MCP server
 * - mcporter_call: Call a specific MCP tool
 * 
 * Config Resolution:
 * 1. Explicit configPath parameter
 * 2. Project: <cwd>/.pi/compound-engineering/mcporter.json
 * 3. Global: ~/.pi/agent/compound-engineering/mcporter.json
 * 4. Bundled: <extension-dir>/../pi-resources/compound-engineering/mcporter.json
 */

import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { Type } from "@sinclair/typebox"

const MAX_BYTES = 50 * 1024

function truncate(value: string): string {
  const input = value ?? ""
  if (Buffer.byteLength(input, "utf8") <= MAX_BYTES) return input
  const head = input.slice(0, MAX_BYTES)
  return head + "\n\n[Output truncated to 50KB]"
}

function resolveBundledMcporterConfigPath(): string | undefined {
  try {
    const extensionDir = path.dirname(fileURLToPath(import.meta.url))
    const candidates = [
      path.join(extensionDir, "..", "pi-resources", "compound-engineering", "mcporter.json"),
      path.join(extensionDir, "..", "compound-engineering", "mcporter.json"),
    ]

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return candidate
    }
  } catch {
    // noop: bundled path is best-effort fallback
  }

  return undefined
}

function resolveMcporterConfigPath(cwd: string, explicit?: string): string | undefined {
  if (explicit && explicit.trim()) {
    return path.resolve(explicit)
  }

  const projectPath = path.join(cwd, ".pi", "compound-engineering", "mcporter.json")
  if (fs.existsSync(projectPath)) return projectPath

  const globalPath = path.join(os.homedir(), ".pi", "agent", "compound-engineering", "mcporter.json")
  if (fs.existsSync(globalPath)) return globalPath

  return resolveBundledMcporterConfigPath()
}

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "mcporter_list",
    label: "MCPorter List",
    description: "List tools on an MCP server through MCPorter.",
    parameters: Type.Object({
      server: Type.String({ description: "Configured MCP server name" }),
      allParameters: Type.Optional(Type.Boolean({ default: false })),
      json: Type.Optional(Type.Boolean({ default: true })),
      configPath: Type.Optional(Type.String({ description: "Optional mcporter config path" })),
    }),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const args = ["list", params.server]
      if (params.allParameters) args.push("--all-parameters")
      if (params.json ?? true) args.push("--json")

      const configPath = resolveMcporterConfigPath(ctx.cwd, params.configPath)
      if (configPath) {
        args.push("--config", configPath)
      }

      const result = await pi.exec("mcporter", args, { signal })
      const output = truncate(result.stdout || result.stderr || "")

      return {
        isError: result.code !== 0,
        content: [{ type: "text", text: output || "(no output)" }],
        details: {
          exitCode: result.code,
          command: "mcporter " + args.join(" "),
          configPath,
        },
      }
    },
  })

  pi.registerTool({
    name: "mcporter_call",
    label: "MCPorter Call",
    description: "Call a specific MCP tool through MCPorter.",
    parameters: Type.Object({
      call: Type.Optional(Type.String({ description: "Function-style call, e.g. linear.list_issues(limit: 5)" })),
      server: Type.Optional(Type.String({ description: "Server name (if call is omitted)" })),
      tool: Type.Optional(Type.String({ description: "Tool name (if call is omitted)" })),
      args: Type.Optional(Type.Record(Type.String(), Type.Any(), { description: "JSON arguments object" })),
      configPath: Type.Optional(Type.String({ description: "Optional mcporter config path" })),
    }),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const args = ["call"]

      if (params.call && params.call.trim()) {
        args.push(params.call.trim())
      } else {
        if (!params.server || !params.tool) {
          return {
            isError: true,
            content: [{ type: "text", text: "Provide either call, or server + tool." }],
            details: {},
          }
        }
        args.push(params.server + "." + params.tool)
        if (params.args) {
          args.push("--args", JSON.stringify(params.args))
        }
      }

      args.push("--output", "json")

      const configPath = resolveMcporterConfigPath(ctx.cwd, params.configPath)
      if (configPath) {
        args.push("--config", configPath)
      }

      const result = await pi.exec("mcporter", args, { signal })
      const output = truncate(result.stdout || result.stderr || "")

      return {
        isError: result.code !== 0,
        content: [{ type: "text", text: output || "(no output)" }],
        details: {
          exitCode: result.code,
          command: "mcporter " + args.join(" "),
          configPath,
        },
      }
    },
  })
}
