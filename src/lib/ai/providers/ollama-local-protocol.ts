import { z } from "zod";
import type { AiCompletionResult } from "../contracts";
import { AiProviderError } from "../errors";

const responseSchema = z.object({
  model: z.string().min(1),
  message: z.object({ content: z.string() }),
  prompt_eval_count: z.number().optional(),
  eval_count: z.number().optional(),
  done_reason: z.string().optional(),
});

function retryAfterMs(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

export function ollamaHttpError(status: number, retryAfter: string | null) {
  if (status === 401 || status === 403) {
    return new AiProviderError("Ollama rejected the request credentials.", {
      code: "authentication",
      provider: "ollama-local",
    });
  }
  if (status === 404) {
    return new AiProviderError(
      "Ollama endpoint or configured model was not found.",
      {
        code: "configuration",
        provider: "ollama-local",
      },
    );
  }
  if (status === 429) {
    return new AiProviderError("Ollama rate-limited the request.", {
      code: "rate-limited",
      provider: "ollama-local",
      retryable: true,
      retryAfterMs: retryAfterMs(retryAfter),
    });
  }
  return new AiProviderError(`Ollama returned HTTP ${status}.`, {
    code: status >= 500 ? "unavailable" : "unknown",
    provider: "ollama-local",
    retryable: status >= 500,
  });
}

export async function readOllamaResponse(
  response: Response,
): Promise<AiCompletionResult> {
  try {
    const payload = responseSchema.parse(await response.json());
    return {
      content: payload.message.content,
      provider: "ollama-local",
      model: payload.model,
      usage: {
        inputTokens: payload.prompt_eval_count,
        outputTokens: payload.eval_count,
      },
      finishReason: payload.done_reason,
    };
  } catch (cause) {
    throw new AiProviderError("Ollama returned an invalid response.", {
      code: "invalid-response",
      provider: "ollama-local",
      cause,
    });
  }
}
