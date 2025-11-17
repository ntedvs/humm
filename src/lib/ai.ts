import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic()

const ANALYSIS_PROMPT = `You are analyzing a pitch deck for Active Angels, an angel investment group.

You must call the pitch_analysis tool with the following information:

1. **summary**: A concise one-page investment summary with exactly 5 sections. Each section should be a SINGLE paragraph (3-5 sentences).

## Overview
Write one paragraph summarizing the company, what they do, and the investment opportunity.

## Problem & Solution
Write one paragraph describing the problem they're solving, their solution, and why it's better than alternatives.

## Product & Market Traction
Write one paragraph covering their product/service, target customers, current traction (revenue, customers, metrics), and market opportunity.

## Team & Differentiators
Write one paragraph about the founders, key team members, what makes them qualified, competitive advantages, and any notable advisors or investors.

## Financials & Outlook
Write one paragraph covering the funding ask, valuation, current revenue, use of funds, and financial projections or key metrics.

**Summary formatting rules:**
- Use markdown headers (##) for section titles
- Each section = exactly ONE paragraph of 3-5 sentences
- If information is missing, write "Not mentioned in deck" within the paragraph
- Be concise and analytical
- Total output should fit on one page
- Do not use formatting symbols, tables, bullet points, or other structured formatting elements
- Never use em dashes (—). Use commas, periods, or regular hyphens (-) instead

2. **Structured fields** (extract ONLY if explicitly mentioned, otherwise use null):
- **description**: 1-2 sentence description of what the company does (null if not clear)
- **stage**: Investment stage like "Pre-seed", "Seed", "Series A", etc. (null if not mentioned)
- **valuation**: Current company valuation as a number (null if not mentioned)
- **askingAmount**: Amount of funding they are requesting as a number (null if not mentioned)

**CRITICAL**: For structured fields, if the information is not EXPLICITLY stated in the deck, you MUST pass null. Do not guess, infer, or estimate. Only extract information that is clearly present.`

type AnalysisResult = {
  summary: string
  description: string | null
  stage: string | null
  valuation: string | null
  askingAmount: string | null
}

export const analyzePitchDeck = async (
  buffer: Buffer,
  fileName: string,
): Promise<AnalysisResult> => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      tools: [
        {
          name: "pitch_analysis",
          description:
            "Submit the pitch deck analysis with summary and structured data fields",
          input_schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "The 5-section investment summary",
              },
              description: {
                type: ["string", "null"],
                description:
                  "1-2 sentence description of what the company does, or null if not clear",
              },
              stage: {
                type: ["string", "null"],
                description:
                  "Investment stage (Pre-seed, Seed, Series A, etc.), or null if not mentioned",
              },
              valuation: {
                type: ["number", "null"],
                description:
                  "Current company valuation as a number, or null if not mentioned",
              },
              askingAmount: {
                type: ["number", "null"],
                description:
                  "Amount of funding requested as a number, or null if not mentioned",
              },
            },
            required: [
              "summary",
              "description",
              "stage",
              "valuation",
              "askingAmount",
            ],
          },
        },
      ],
      tool_choice: { type: "tool", name: "pitch_analysis" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: buffer.toString("base64"),
              },
            },
            {
              type: "text",
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    })

    const toolUse = response.content.find((block) => block.type === "tool_use")
    if (!toolUse || toolUse.type !== "tool_use") {
      throw Error("No tool use in Claude response")
    }

    const input = toolUse.input as {
      summary: string
      description: string | null
      stage: string | null
      valuation: number | null
      askingAmount: number | null
    }

    return {
      summary: input.summary,
      description: input.description,
      stage: input.stage,
      valuation: input.valuation !== null ? String(input.valuation) : null,
      askingAmount:
        input.askingAmount !== null ? String(input.askingAmount) : null,
    }
  } catch (error) {
    console.error("AI analysis failed:", error)
    throw Error(
      `Failed to analyze document: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}
