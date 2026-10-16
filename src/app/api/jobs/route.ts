import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getAuthenticatedIdentity,
  hasClerkConfiguration,
} from "@/lib/auth/identity";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { searchJobs } from "@/lib/jobs/search";

export async function GET(request: Request) {
  if (!hasClerkConfiguration()) {
    return apiError("Authentication is not configured", 503);
  }

  let identity: Awaited<ReturnType<typeof getAuthenticatedIdentity>>;

  try {
    identity = await getAuthenticatedIdentity();
  } catch (error) {
    console.error("Job search authentication failed:", {
      errorName: error instanceof Error ? error.name : "unknown",
    });

    return apiError("Authentication could not be verified", 503);
  }

  if (!identity) {
    return apiError("Authentication required", 401);
  }

  const params = new URL(request.url).searchParams;

  const rawQuery = params.get("query") ?? undefined;
  const rawLocation = params.get("location") ?? undefined;
  const rawCountryCode = params.get("countryCode") ?? undefined;
  const rawPage = params.get("page");
  const rawPageSize = params.get("pageSize");

  const input = {
    query: rawQuery,
    location: rawLocation,
    countryCode: rawCountryCode,
    ...(rawPage !== null ? { page: Number(rawPage) } : {}),
    ...(rawPageSize !== null ? { pageSize: Number(rawPageSize) } : {}),
  };

  try {
    const jobs = await searchJobs(input);

    return NextResponse.json({
      jobs,
      count: jobs.length,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError("Invalid job search parameters", 400);
    }

    if (
      error instanceof Error &&
      (error.message === "No job providers are configured." ||
        error.message === "All configured job providers failed.")
    ) {
      return apiError("Job search is temporarily unavailable", 503);
    }

    return apiFailure(error);
  }
}
