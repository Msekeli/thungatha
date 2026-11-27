import { afterEach, describe, expect, it, vi } from "vitest";
import { createOllamaLocalAdapter } from "@/lib/ai/providers/ollama-local-adapter";

const request = {
  task: "job-requirement-extraction" as const,
  systemPrompt: "Return a JSON object.",
  userPrompt: "Extract requirements.",
  responseFormat: "json" as const,
};

function fetcher(body: unknown, status = 200, headers?: HeadersInit) {
  return vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response(JSON.stringify(body), { status, headers }));
}

afterEach(() => vi.unstubAllEnvs());

describe("Ollama Local adapter", () => {
  it("does not force a reasoning setting when the task has no preference", async () => {
    const call = fetcher({
      model: "qwen3.5:4b",
      message: { content: '{"requirements":[]}' },
      prompt_eval_count: 12,
      eval_count: 4,
      done_reason: "stop",
    });
    const result = await createOllamaLocalAdapter({
      model: "qwen3.5:4b",
      fetcher: call,
    }).complete(request);
    const [url, init] = call.mock.calls[0] ?? [];
    const body = JSON.parse(String(init?.body));
    expect(url).toBe("http://127.0.0.1:11434/api/chat");
    expect(body).toMatchObject({
      model: "qwen3.5:4b",
      stream: false,
      format: "json",
      messages: [{ role: "system" }, { role: "user" }],
    });
    expect(body).not.toHaveProperty("think");
    expect(result).toMatchObject({
      provider: "ollama-local",
      model: "qwen3.5:4b",
      content: '{"requirements":[]}',
      usage: { inputTokens: 12, outputTokens: 4 },
    });
  });

  it("passes task-level reasoning configuration to Ollama", async () => {
    const call = fetcher({
      model: "qwen3.5:4b",
      message: { content: '{"classification":"match"}' },
    });
    await createOllamaLocalAdapter({
      model: "qwen3.5:4b",
      fetcher: call,
    }).complete({
      ...request,
      task: "job-fit-assessment",
      reasoning: true,
    });
    const body = JSON.parse(String(call.mock.calls[0]?.[1]?.body));
    expect(body.think).toBe(true);
  });

  it("requires a model to be configured", async () => {
    vi.stubEnv("OLLAMA_LOCAL_MODEL", "");
    await expect(
      createOllamaLocalAdapter().complete(request),
    ).rejects.toMatchObject({ code: "configuration" });
  });

  it("classifies a missing model as configuration failure", async () => {
    const call = fetcher({}, 404);
    await expect(
      createOllamaLocalAdapter({ model: "missing", fetcher: call }).complete(
        request,
      ),
    ).rejects.toMatchObject({ code: "configuration", retryable: false });
  });

  it("preserves retry-after information for rate limits", async () => {
    const call = fetcher({}, 429, { "retry-after": "2" });
    await expect(
      createOllamaLocalAdapter({ model: "local", fetcher: call }).complete(
        request,
      ),
    ).rejects.toMatchObject({
      code: "rate-limited",
      retryable: true,
      retryAfterMs: 2000,
    });
  });

  it("rejects malformed provider responses", async () => {
    const call = fetcher({ message: { content: 42 } });
    await expect(
      createOllamaLocalAdapter({ model: "local", fetcher: call }).complete(
        request,
      ),
    ).rejects.toMatchObject({ code: "invalid-response" });
  });

  it("classifies request timeouts as retryable", async () => {
    const call = vi
      .fn<typeof fetch>()
      .mockRejectedValue(
        Object.assign(new Error("timed out"), { name: "TimeoutError" }),
      );
    await expect(
      createOllamaLocalAdapter({ model: "local", fetcher: call }).complete(
        request,
      ),
    ).rejects.toMatchObject({ code: "timeout", retryable: true });
  });
});
