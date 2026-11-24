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
    return {
      ...content,
      workExperience: content.workExperience.map((item) => {
        if (item.sourceId !== experience[1]) return item;
        if (item.description !== suggestion.originalText) throw new Error("This suggestion is stale.");
        return { ...item, description: proposedText };
      }),
    };
  }

  const achievement = targetPath.match(
    /^workExperience\[(.+)\]\.achievements\[(\d+)\]$/,
  );
  if (achievement) {
    return {
      ...content,
      workExperience: content.workExperience.map((item) => {
        if (item.sourceId !== achievement[1]) return item;
        const index = Number(achievement[2]);
        if (item.achievements[index] !== suggestion.originalText) throw new Error("This suggestion is stale.");
        return {
          ...item,
          achievements: item.achievements.map((value, currentIndex) =>
            currentIndex === index ? proposedText : value,
          ),
        };
      }),
    };
  }

  const project = targetPath.match(/^projects\[(.+)\]\.description$/);
  if (project) {
    return {
      ...content,
      projects: content.projects.map((item) => {
        if (item.sourceId !== project[1]) return item;
        if (item.description !== suggestion.originalText) throw new Error("This suggestion is stale.");
        return { ...item, description: proposedText };
      }),
    };
  }
  throw new Error("The CV suggestion targets an unsupported field.");
}
