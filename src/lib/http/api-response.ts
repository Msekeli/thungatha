import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

type ApiErrorResponse = {
  error: string;
  requestId?: string;
};

export function apiError(message: string, status: number) {
  return NextResponse.json<ApiErrorResponse>({ error: message }, { status });
}

export function describeApiError(error: unknown) {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      message: error.message,
      ...(error.cause === undefined
        ? {}
        : { cause: describeApiError(error.cause) }),
    };
  }

  if (typeof error === "object" && error !== null) {
    const value = error as Record<string, unknown>;
    return {
      errorName: typeof value.name === "string" ? value.name : "unknown",
      ...(typeof value.message === "string" ? { message: value.message } : {}),
      ...(typeof value.code === "string" ? { code: value.code } : {}),
      ...(typeof value.details === "string" ? { details: value.details } : {}),
      ...(typeof value.hint === "string" ? { hint: value.hint } : {}),
      ...(typeof value.status === "number" ? { status: value.status } : {}),
    };
  }

  return {
    errorName: typeof error,
    message: String(error),
  };
}

export function apiFailure(error: unknown) {
  if (error instanceof SyntaxError) {
    return apiError("Invalid JSON body", 400);
  }

  const requestId = randomUUID();

  console.error("API request failed:", {
    requestId,
    ...describeApiError(error),
  });

  return NextResponse.json<ApiErrorResponse>(
    {
      error: "The request could not be completed. Please try again.",
      requestId,
    },
    { status: 500 },
  );
}
