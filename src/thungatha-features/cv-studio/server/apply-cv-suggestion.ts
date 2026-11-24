import type { CvSuggestion } from "./cv-studio-schema";
import type { CvContent } from "./cv-studio-schema";

export function applyCvSuggestion(
  content: CvContent,
  suggestion: CvSuggestion,
): CvContent {
  const { targetPath, proposedText } = suggestion;
  if (targetPath === "headline") return { ...content, headline: proposedText };
  if (targetPath === "professionalSummary") {
    return { ...content, professionalSummary: proposedText };
  }

  const experience = targetPath.match(
    /^workExperience\[(.+)\]\.description$/,
  );
  if (experience) {
    return {
      ...content,
      workExperience: content.workExperience.map((item) =>
        item.sourceId === experience[1]
          ? { ...item, description: proposedText }
          : item,
      ),
    };
  }

  const achievement = targetPath.match(
    /^workExperience\[(.+)\]\.achievements\[(\d+)\]$/,
  );
  if (achievement) {
    return {
      ...content,
      workExperience: content.workExperience.map((item) =>
        item.sourceId === achievement[1]
          ? {
              ...item,
              achievements: item.achievements.map((value, index) =>
                index === Number(achievement[2]) ? proposedText : value,
              ),
            }
          : item,
      ),
    };
  }

  const project = targetPath.match(/^projects\[(.+)\]\.description$/);
  if (project) {
    return {
      ...content,
      projects: content.projects.map((item) =>
        item.sourceId === project[1]
          ? { ...item, description: proposedText }
          : item,
      ),
    };
  }
  throw new Error("The CV suggestion targets an unsupported field.");
}
