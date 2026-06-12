import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
const env = readFileSync(new URL("../.env.local", import.meta.url),"utf8");
const key = env.split("\n").find(l=>l.startsWith("ANTHROPIC_API_KEY="))?.slice("ANTHROPIC_API_KEY=".length).trim();
const a = new Anthropic({ apiKey: key });
try {
  const m = await a.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 50,
    messages: [{ role: "user", content: "Responda apenas: OK FUNCIONANDO" }],
  });
  console.log("✓ Resposta:", m.content[0].text);
  console.log("✓ Tokens:", m.usage.input_tokens, "in /", m.usage.output_tokens, "out");
} catch (e) {
  console.error("✗ ERRO:", e.status, "-", e.message);
}
