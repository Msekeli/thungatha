import { timingSafeEqual } from "node:crypto";

export function isScoutImportAuthorised(request: Request) {
  const expectedSecret = process.env.SCOUT_SYNC_SECRET;
  if (!expectedSecret) return false;
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  const expectedBytes = Buffer.from(expectedSecret);
  const suppliedBytes = Buffer.from(supplied);
  return suppliedBytes.length === expectedBytes.length &&
    timingSafeEqual(suppliedBytes, expectedBytes);
}
