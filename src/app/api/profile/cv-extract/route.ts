import { NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import {
  createAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";
import { extractCv } from "@/thungatha-features/user-profile/server/cv-extraction";
const BUCKET = "profile-cvs",
  MAX_FILE_SIZE = 5 * 1024 * 1024;
export async function POST(request: Request) {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;
  try {
    const body = (await request.json()) as {
      storagePath?: unknown;
      filename?: unknown;
    };
    if (
      typeof body.storagePath !== "string" ||
      typeof body.filename !== "string"
    )
      return apiError("Choose an uploaded CV to extract", 400);
    const filename = body.filename.toLowerCase(),
      format = filename.endsWith(".pdf")
        ? "pdf"
        : filename.endsWith(".docx")
          ? "docx"
          : null;
    if (!format) return apiError("Only PDF and DOCX files are supported", 415);
    const prefix = `${identity.userId}/staged/`;
    if (
      !body.storagePath.startsWith(prefix) ||
      body.storagePath.length > 500 ||
      body.storagePath.includes("..")
    )
      return apiError("The uploaded CV reference is invalid", 403);
    const supabase = await createAuthenticatedSupabaseClient(identity.getToken);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(body.storagePath);
    if (error || !data)
      return apiError(
        "The staged CV could not be found. Upload it again and retry.",
        404,
      );
    if (data.size === 0 || data.size > MAX_FILE_SIZE)
      return apiError("The CV file is empty or exceeds 5 MB", 413);
    const result = await extractCv(
      new Uint8Array(await data.arrayBuffer()),
      format,
    );
    return NextResponse.json({ extraction: result });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError)
      return apiError("CV storage is not configured", 503);
    if (error instanceof SyntaxError)
      return apiError("The extraction request was invalid", 400);
    return apiFailure(error);
  }
}
