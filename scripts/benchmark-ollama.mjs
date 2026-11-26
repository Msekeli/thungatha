import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";

async function loadLocalEnv() {
  try {
    const contents = await readFile(".env.local", "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*(OLLAMA_LOCAL_BASE_URL|OLLAMA_LOCAL_MODEL)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  } catch {}
}

function seconds(nanoseconds) {
  return typeof nanoseconds === "number" ? `${(nanoseconds / 1e9).toFixed(2)}s` : "not reported";
}

async function main() {
  await loadLocalEnv();
  const baseUrl = (process.env.OLLAMA_LOCAL_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
  const model = process.env.OLLAMA_LOCAL_MODEL || "qwen3.5:4b";

  const tagsResponse = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(10_000) });
  if (!tagsResponse.ok) throw new Error(`Ollama model check failed: HTTP ${tagsResponse.status}`);
  const tags = await tagsResponse.json();
  const installed = (tags.models || []).some((item) => item.name === model || item.model === model);
  if (!installed) {
    const available = (tags.models || []).map((item) => item.name || item.model).join(", ");
    throw new Error(`Model "${model}" is not installed. Available models: ${available || "none"}`);
  }

  const systemPrompt = [
    "You are a CV wording assistant.",
    "Use only the facts in the supplied source material.",
    "Improve clarity and professional wording without adding, assuming, or exaggerating facts.",
    "Do not invent metrics, dates, tools, responsibilities, seniority, or achievements.",
    "Return exactly four concise CV bullet points and nothing else.",
  ].join(" ");
  const userPrompt = `Rewrite this fictional source material as four CV bullet points.
  - Built reusable React components for a web application.
  - Integrated REST API responses into frontend screens.
  - Worked with designers and backend developers to deliver interface changes.
  - Added unit tests using Vitest.
  Keep every statement traceable to these facts. Do not add details.`;

  console.log(`Model: ${model}`);
  console.log(`Ollama: ${baseUrl}`);
  console.log("Task: rewrite a short experience section using source facts only.");
  console.log("Two identical requests will run; request 1 may or may not include model loading.\n");

  for (let index = 1; index <= 2; index += 1) {
    const started = performance.now();
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(180_000),
      body: JSON.stringify({
        model,
        think: false,
        stream: false,
        keep_alive: "5m",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        options: { temperature: 0, num_predict: 180 },
      }),
    });
    const elapsed = (performance.now() - started) / 1000;
    const result = await response.json();
    if (!response.ok) throw new Error(`Ollama request failed: HTTP ${response.status} — ${JSON.stringify(result)}`);

    console.log(`--- Request ${index} ---`);
    console.log(`Wall-clock: ${elapsed.toFixed(2)}s`);
    console.log(`Model load: ${seconds(result.load_duration)}`);
    console.log(`Prompt evaluation: ${seconds(result.prompt_eval_duration)} (${result.prompt_eval_count ?? "?"} tokens)`);
    console.log(`Generation: ${seconds(result.eval_duration)} (${result.eval_count ?? "?"} tokens)`);
    console.log("Output:");
    console.log(result.message?.content || "(no message content)");
    console.log();
  }
}

main().catch((error) => {
  console.error(`Benchmark failed: ${error.message}`);
  process.exitCode = 1;
});
