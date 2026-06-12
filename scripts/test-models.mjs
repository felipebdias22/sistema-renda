import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
const env = readFileSync(new URL("../.env.local", import.meta.url),"utf8");
const key = env.split("\n").find(l=>l.startsWith("ANTHROPIC_API_KEY="))?.slice("ANTHROPIC_API_KEY=".length).trim();
const a = new Anthropic({ apiKey: key });
const models = ["claude-sonnet-4-6","claude-opus-4-8","claude-haiku-4-5-20251001","claude-sonnet-4-5-20250929","claude-3-5-sonnet-20241022"];
for (const model of models) {
  try {
    const m = await a.messages.create({ model, max_tokens: 10, messages: [{ role: "user", content: "oi" }] });
    console.log(`✓ ${model} — OK`);
  } catch (e) {
    console.log(`✗ ${model} — ${e.status} ${e.error?.error?.message ?? e.message}`);
  }
}
