export function calculatePinchZoom(
  startZoom: number,
  startDistance: number,
  currentDistance: number,
): number {
  if (
    !Number.isFinite(startZoom) ||
    !Number.isFinite(startDistance) ||
    !Number.isFinite(currentDistance) ||
    startDistance <= 0 ||
    currentDistance <= 0
  ) {
    return startZoom;
  }

  const nextZoom =
    Math.round((startZoom * currentDistance) / startDistance / 5) * 5;

  return Math.min(200, Math.max(50, nextZoom));
}
