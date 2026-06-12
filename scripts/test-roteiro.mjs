import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
const env = readFileSync(new URL("../.env.local", import.meta.url),"utf8");
const key = env.split("\n").find(l=>l.startsWith("ANTHROPIC_API_KEY="))?.slice("ANTHROPIC_API_KEY=".length).trim();
const a = new Anthropic({ apiKey: key });
const SYSTEM = `Você é um copywriter especialista em conteúdo viral para Facebook e Reels. A partir de um tema/nicho, gere conteúdo de altíssima conversão em PT-BR. Responda SOMENTE com JSON válido: {"titulo":"...","descricao":"...","roteiro":"[0:00 - 0:15] Hook: ...\\n[0:15 - 1:30] Conteúdo: ..."}`;
const m = await a.messages.create({
  model: "claude-sonnet-4-6", max_tokens: 1000, system: SYSTEM,
  messages: [{ role: "user", content: 'Tema/nicho: "Receitas fit para emagrecer". Gere o conteúdo no formato JSON.' }],
});
const text = m.content[0].text;
const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
console.log("TÍTULO:", json.titulo);
console.log("\nDESCRIÇÃO:", json.descricao);
console.log("\nROTEIRO:\n" + json.roteiro);
