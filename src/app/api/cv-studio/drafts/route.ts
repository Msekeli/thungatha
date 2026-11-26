import { createCvDraft } from "@/thungatha-features/cv-studio/server/create-cv-draft";
import { updateCvDraft } from "@/thungatha-features/cv-studio/server/update-cv-draft";

export async function POST(request: Request) {
  return createCvDraft(request);
}

export async function PUT(request: Request) {
  return updateCvDraft(request);
}
