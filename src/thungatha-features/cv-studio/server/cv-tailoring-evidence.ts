import type { CvContent } from "./cv-studio-schema";

export type CvTailoringEvidence = {
  profileEvidence: Array<{ id: string; content: string }>;
  editableTargets: Array<{ path: string; currentText: string | null }>;
};

export function buildCvTailoringEvidence(
  content: CvContent,
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

  addEvidence("headline", content.headline);
  addTarget("headline", content.headline);
  addEvidence("professionalSummary", content.professionalSummary);
  addTarget("professionalSummary", content.professionalSummary);

  content.technicalSkills.forEach((skill, index) =>
    addEvidence(`technicalSkills[${index}]`, skill),
  );
  content.workExperience.forEach((item) => {
    const base = `workExperience[${item.sourceId}]`;
    addEvidence(`${base}.jobTitle`, item.jobTitle);
    addEvidence(`${base}.employer`, item.employer);
    addEvidence(`${base}.description`, item.description);
    addTarget(`${base}.description`, item.description);
    item.achievements.forEach((achievement, index) => {
      addEvidence(`${base}.achievements[${index}]`, achievement);
      addTarget(`${base}.achievements[${index}]`, achievement);
    });
  });
  content.projects.forEach((item) => {
    const base = `projects[${item.sourceId}]`;
    addEvidence(`${base}.name`, item.name);
    addEvidence(`${base}.role`, item.role);
    addEvidence(`${base}.description`, item.description);
    addTarget(`${base}.description`, item.description);
  });
  content.education.forEach((item) => {
    const base = `education[${item.sourceId}]`;
    addEvidence(`${base}.qualification`, item.qualification);
    addEvidence(`${base}.institution`, item.institution);
    addEvidence(`${base}.fieldOfStudy`, item.fieldOfStudy);
  });
  content.certifications.forEach((item) => {
    const base = `certifications[${item.sourceId}]`;
    addEvidence(`${base}.name`, item.name);
    addEvidence(`${base}.issuer`, item.issuer);
  });
  content.languages.forEach((language, index) =>
    addEvidence(`languages[${index}]`, language),
  );

  return { profileEvidence, editableTargets };
}
