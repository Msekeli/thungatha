import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { apiError, apiFailure } from "@/lib/http/api-response";
import { createAuthenticatedSupabaseClient, SupabaseConfigurationError } from "@/lib/supabase/server";
import { resolveProfileIdentity } from "@/thungatha-features/user-profile/server/profile-route-auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PDF_TYPE = "application/pdf";
const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const BUCKET = "profile-cvs";

function fileExtension(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") && file.type === PDF_TYPE) return "pdf";
  if (name.endsWith(".docx") && file.type === DOCX_TYPE) return "docx";
  return null;
}

export async function POST(request: Request) {
  const { identity, response } = await resolveProfileIdentity();
  if (response || !identity) return response;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) return apiError("Choose a CV file to upload", 400);
    const extension = fileExtension(value);
    if (!extension) return apiError("Upload a PDF or DOCX file", 415);
    if (value.size === 0) return apiError("The selected file is empty", 400);
    if (value.size > MAX_FILE_SIZE) return apiError("CV files must be 5 MB or smaller", 413);
    const bytes = new Uint8Array(await value.arrayBuffer());
    const isPdf = extension === "pdf" && new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
    const isDocx = extension === "docx" && bytes[0] === 0x50 && bytes[1] === 0x4b;
    if (!isPdf && !isDocx) return apiError("The file content does not match a supported CV format", 415);

    const supabase = await createAuthenticatedSupabaseClient(identity.getToken);
    const safeName = value.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180);
    const storagePath = `${identity.userId}/staged/${randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
      contentType: extension === "pdf" ? PDF_TYPE : DOCX_TYPE, cacheControl: "3600", upsert: false,
    });
    if (error) {
      console.error("CV upload failed", { errorName: error.name });
      return apiError("We couldn’t upload your CV. Please try again.", 500);
    }
    return NextResponse.json({ upload: {
      filename: value.name, fileSize: value.size, uploadedAt: new Date().toISOString(),
      storagePath, status: "staged",
    } }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) return apiError("CV storage is not configured", 503);
    if (error instanceof TypeError) return apiError("The upload request was invalid", 400);
    return apiFailure(error);
  }
}
