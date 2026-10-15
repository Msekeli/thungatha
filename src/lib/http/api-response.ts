import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

type ApiErrorResponse = {
  error: string;
  requestId?: string;
};

export function apiError(message: string, status: number) {
  return NextResponse.json<ApiErrorResponse>({ error: message }, { status });
}

export function apiFailure(error: unknown) {
  if (error instanceof SyntaxError) {
    return apiError("Invalid JSON body", 400);
  }

  const requestId = randomUUID();

  console.error("API request failed:", {
    requestId,
    errorName: error instanceof Error ? error.name : "unknown",
  });

  return NextResponse.json<ApiErrorResponse>(
    {
      error: "The request could not be completed. Please try again.",
      requestId,
    },
    { status: 500 },
  );
}
