import type { CvContent, CvSuggestion } from "./cv-studio-schema";

/** Restore the exact text that was replaced by an accepted suggestion. */
export function undoCvSuggestion(
  content: CvContent,
  suggestion: CvSuggestion,
): CvContent {
  const { targetPath, originalText, proposedText } = suggestion;
  if (targetPath === "professionalSummary") {
    if (content.professionalSummary !== proposedText) {
      throw new Error(
        "This change can no longer be undone because the summary has changed.",
      );
    }
    if (originalText === null) {
      throw new Error("The original summary is unavailable.");
    }
    return { ...content, professionalSummary: originalText };
  }

  const experience = targetPath.match(
    /^workExperience\[(.+)\]\.description$/,
  );
  if (experience) {
    const item = content.workExperience.find(
      (entry) => entry.sourceId === experience[1],
    );
    if (!item || item.description !== proposedText) {
      throw new Error(
        "This change can no longer be undone because the experience description has changed.",
      );
    }
    return {
      ...content,
      workExperience: content.workExperience.map((entry) =>
        entry.sourceId === experience[1]
          ? { ...entry, description: originalText }
          : entry,
      ),
    };
  }
  throw new Error("Undo is not supported for this CV field.");
}
