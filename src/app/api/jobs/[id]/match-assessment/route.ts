import { connection } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/http/api-response";
import { requireAuthIdentity } from "./auth-helper";
import { getMatchAssessment } from "./get-match-assessment";
import { postMatchAssessment } from "./post-match-assessment";

export const maxDuration = 120;
const idSchema = z.string().uuid();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  await connection();
  const { errorResponse, identity } = await requireAuthIdentity();
  if (errorResponse || !identity) return errorResponse;

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);
  return getMatchAssessment(id, identity);
}

export async function POST(_request: Request, context: RouteContext) {
  await connection();
  const { errorResponse, identity } = await requireAuthIdentity();
  if (errorResponse || !identity) return errorResponse;

  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return apiError("Invalid job ID", 400);
  return postMatchAssessment(id, identity);
}
