import { NextResponse } from "next/server";

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function apiFailure(error: unknown) {
  if (error instanceof SyntaxError) return apiError("Invalid JSON body", 400);
  console.error(
    "Profile request failed",
    error instanceof Error ? error.name : "unknown",
  );
  return apiError("The request could not be completed", 500);
}
