import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic()

const ANALYSIS_PROMPT = `You are analyzing a pitch deck for Active Angels, an angel investment group.

Provide a concise one-page investment summary with exactly 5 sections. Each section should be a SINGLE paragraph (3-5 sentences).

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

**Critical formatting rules:**
- Use markdown headers (##) for section titles
- Each section = exactly ONE paragraph of 3-5 sentences
- If information is missing, write "Not mentioned in deck" within the paragraph
- Be concise and analytical
- Total output should fit on one page
- Do not use formatting symbols, tables, bullet points, or other structured formatting elements
- Never use em dashes (—). Use commas, periods, or regular hyphens (-) instead

Analyze the document now:`

export const analyzePitchDeck = async (buffer: Buffer, fileName: string) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
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

    const block = response.content.find((block) => block.type === "text")
    if (!block || block.type !== "text") {
      throw Error("No text content in Claude response")
    }

    return block.text
  } catch (error) {
    console.error("AI analysis failed:", error)
    throw Error(
      `Failed to analyze document: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}
