import type { CvContent } from "./cv-studio-schema";

export type CvTailoringEvidence = {
  profileEvidence: Array<{ id: string; content: string }>;
  editableTargets: Array<{ path: string; currentText: string | null }>;
};

export function buildCvTailoringEvidence(
  sourceContent: CvContent,
  currentContent: CvContent = sourceContent,
): CvTailoringEvidence {
  const profileEvidence: CvTailoringEvidence["profileEvidence"] = [];
  const editableTargets: CvTailoringEvidence["editableTargets"] = [];
  const addEvidence = (path: string, value: string | null | undefined) => {
    if (value?.trim()) {
      profileEvidence.push({ id: `cv:${path}`, content: value.trim() });
    }
  };
  const addTarget = (path: string, value: string | null) => {
    editableTargets.push({ path, currentText: value });
  };

  addEvidence("headline", sourceContent.headline);
  addTarget("headline", currentContent.headline);
  addEvidence("professionalSummary", sourceContent.professionalSummary);
  addTarget("professionalSummary", currentContent.professionalSummary);

  sourceContent.technicalSkills.forEach((skill, index) =>
    addEvidence(`technicalSkills[${index}]`, skill),
  );
  sourceContent.workExperience.forEach((item) => {
    const base = `workExperience[${item.sourceId}]`;
    addEvidence(`${base}.jobTitle`, item.jobTitle);
    addEvidence(`${base}.employer`, item.employer);
    addEvidence(`${base}.description`, item.description);
    const current = currentContent.workExperience.find(
      (entry) => entry.sourceId === item.sourceId,
    );
    if (current) {
      addTarget(`${base}.description`, current.description);
      current.achievements.forEach((achievement, index) =>
        addTarget(`${base}.achievements[${index}]`, achievement),
      );
    }
    item.achievements.forEach((achievement, index) =>
      addEvidence(`${base}.achievements[${index}]`, achievement),
    );
  });
  sourceContent.projects.forEach((item) => {
    const base = `projects[${item.sourceId}]`;
    addEvidence(`${base}.name`, item.name);
    addEvidence(`${base}.role`, item.role);
    addEvidence(`${base}.description`, item.description);
    const current = currentContent.projects.find(
      (entry) => entry.sourceId === item.sourceId,
    );
    if (current) addTarget(`${base}.description`, current.description);
  });
  sourceContent.education.forEach((item) => {
    const base = `education[${item.sourceId}]`;
    addEvidence(`${base}.qualification`, item.qualification);
    addEvidence(`${base}.institution`, item.institution);
    addEvidence(`${base}.fieldOfStudy`, item.fieldOfStudy);
  });
  sourceContent.certifications.forEach((item) => {
    const base = `certifications[${item.sourceId}]`;
    addEvidence(`${base}.name`, item.name);
    addEvidence(`${base}.issuer`, item.issuer);
  });
  sourceContent.languages.forEach((language, index) =>
    addEvidence(`languages[${index}]`, language),
  );

  return { profileEvidence, editableTargets };
}
