import type { CvSuggestion } from "./cv-studio-schema";
import type { CvContent } from "./cv-studio-schema";

export function applyCvSuggestion(
  content: CvContent,
  suggestion: CvSuggestion,
): CvContent {
  const { targetPath, proposedText } = suggestion;
  if (targetPath === "headline") {
    if (content.headline !== suggestion.originalText) throw new Error("This suggestion is stale.");
    return { ...content, headline: proposedText };
  }
  if (targetPath === "professionalSummary") {
    if (content.professionalSummary !== suggestion.originalText) throw new Error("This suggestion is stale.");
    return { ...content, professionalSummary: proposedText };
  }

  const experience = targetPath.match(
    /^workExperience\[(.+)\]\.description$/,
  );
  if (experience) {
    const item = content.workExperience.find((entry) => entry.sourceId === experience[1]);
    if (!item || item.description !== suggestion.originalText) throw new Error("This suggestion is stale.");
    return {
      ...content,
      workExperience: content.workExperience.map((entry) =>
        entry.sourceId === experience[1] ? { ...entry, description: proposedText } : entry,
      ),
    };
  }

  const achievement = targetPath.match(
    /^workExperience\[(.+)\]\.achievements\[(\d+)\]$/,
  );
  if (achievement) {
    const item = content.workExperience.find((entry) => entry.sourceId === achievement[1]);
    const index = Number(achievement[2]);
    if (!item || item.achievements[index] !== suggestion.originalText) throw new Error("This suggestion is stale.");
    return {
      ...content,
      workExperience: content.workExperience.map((entry) =>
        entry.sourceId === achievement[1]
          ? { ...entry, achievements: entry.achievements.map((value, i) => i === index ? proposedText : value) }
          : entry,
      ),
    };
  }

  const project = targetPath.match(/^projects\[(.+)\]\.description$/);
  if (project) {
    const item = content.projects.find((entry) => entry.sourceId === project[1]);
    if (!item || item.description !== suggestion.originalText) throw new Error("This suggestion is stale.");
    return {
      ...content,
      projects: content.projects.map((entry) =>
        entry.sourceId === project[1] ? { ...entry, description: proposedText } : entry,
      ),
    };
  }
  throw new Error("The CV suggestion targets an unsupported field.");
}


/** Restore the exact text that was replaced by an accepted suggestion. */
export function undoCvSuggestion(
  content: CvContent,
  suggestion: CvSuggestion,
): CvContent {
  const { targetPath, originalText, proposedText } = suggestion;
  if (targetPath === "professionalSummary") {
    if (content.professionalSummary !== proposedText) throw new Error("This change can no longer be undone because the summary has changed.");
    if (originalText === null) throw new Error("The original summary is unavailable.");
    return { ...content, professionalSummary: originalText };
  }

  const experience = targetPath.match(/^workExperience\\[(.+)\\]\\.description$/);
  if (experience) {
    const item = content.workExperience.find((entry) => entry.sourceId === experience[1]);
    if (!item || item.description !== proposedText) throw new Error("This change can no longer be undone because the experience description has changed.");
    return {
      ...content,
      workExperience: content.workExperience.map((entry) =>
        entry.sourceId === experience[1] ? { ...entry, description: originalText } : entry,
      ),
    };
  }

  throw new Error("Undo is not supported for this CV field.");
}
