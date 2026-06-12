import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Modelo atual da Anthropic (o claude-sonnet-4-20250514 foi descontinuado)
export const IA_MODEL = "claude-sonnet-4-6";
