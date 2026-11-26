import { handleCvStudioRequest } from "@/thungatha-features/cv-studio/server/cv-studio-entry-service";

// Opening CV Studio creates the master CV from the confirmed Profile when needed.
export async function GET() {
  return handleCvStudioRequest();
}

// Kept as an explicit refresh endpoint for Profile changes and manual recovery.
export async function POST() {
  return handleCvStudioRequest();
}
