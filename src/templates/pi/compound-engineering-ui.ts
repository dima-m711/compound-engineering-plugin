/**
 * Compound Engineering UI Extension for Pi
 * 
 * Provides interactive question/choice prompts for AI agents.
 * 
 * Tools:
 * - ask_user_question: Ask the user a question with optional choices
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { Type } from "@sinclair/typebox"

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "ask_user_question",
    label: "Ask User Question",
    description: "Ask the user a question with optional choices.",
    parameters: Type.Object({
      question: Type.String({ description: "Question shown to the user" }),
      options: Type.Optional(Type.Array(Type.String(), { description: "Selectable options" })),
      allowCustom: Type.Optional(Type.Boolean({ default: true })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      if (!ctx.hasUI) {
        return {
          isError: true,
          content: [{ type: "text", text: "UI is unavailable in this mode." }],
          details: {},
        }
      }

      const options = params.options ?? []
      const allowCustom = params.allowCustom ?? true

      if (options.length === 0) {
        const answer = await ctx.ui.input(params.question)
        if (!answer) {
          return {
            content: [{ type: "text", text: "User cancelled." }],
            details: { answer: null },
          }
        }

        return {
          content: [{ type: "text", text: "User answered: " + answer }],
          details: { answer, mode: "input" },
        }
      }

      const customLabel = "Other (type custom answer)"
      const selectable = allowCustom ? [...options, customLabel] : options
      const selected = await ctx.ui.select(params.question, selectable)

      if (!selected) {
        return {
          content: [{ type: "text", text: "User cancelled." }],
          details: { answer: null },
        }
      }

      if (selected === customLabel) {
        const custom = await ctx.ui.input("Your answer")
        if (!custom) {
          return {
            content: [{ type: "text", text: "User cancelled." }],
            details: { answer: null },
          }
        }

        return {
          content: [{ type: "text", text: "User answered: " + custom }],
          details: { answer: custom, mode: "custom" },
        }
      }

      return {
        content: [{ type: "text", text: "User selected: " + selected }],
        details: { answer: selected, mode: "select" },
      }
    },
  })
}
