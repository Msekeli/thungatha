import { z } from "zod";

export function checkReferences(
  refs: string[],
  allowed: Set<string>,
  path: (string | number)[],
  label: string,
  context: z.RefinementCtx,
) {
  refs.forEach((ref, index) => {
    if (!allowed.has(ref)) {
      context.addIssue({
        code: "custom",
        path: [...path, index],
        message: `Unknown ${label} reference: ${ref}`,
      });
    }
  });
}

export function checkRequirementCoverage(
  coveredIds: string[],
  gapIds: string[],
  requirementIds: string[],
  context: z.RefinementCtx,
) {
  const classified = [...coveredIds, ...gapIds];
  const unique = new Set(classified);
  if (
    unique.size !== classified.length ||
    unique.size !== requirementIds.length ||
    requirementIds.some((id) => !unique.has(id))
  ) {
    context.addIssue({
      code: "custom",
      path: ["coveredRequirementIds"],
      message:
        "Every job requirement must be classified exactly once as covered or a gap.",
    });
  }
}
