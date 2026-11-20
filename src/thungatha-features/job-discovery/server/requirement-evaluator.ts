import type { CandidateFacts, RequirementOutcome } from "./relevance-classifier";
import type { JobRequirement } from "./job-requirement-schema";

const normalise = (value: string) => value.trim().toLowerCase().replace(/\\s+/g, " ");

function skillKey(value: string) {
  const aliases: Record<string, string> = {
    "c sharp": "C#", "c#": "C#", "c plus plus": "C++", "c++": "C++",
    dotnet: ".NET", ".net": ".NET", nodejs: "Node.js", "node.js": "Node.js",
    "react.js": "React", react: "React", nextjs: "Next.js", "next.js": "Next.js",
  };
  return aliases[normalise(value)] ?? value.trim();
}

function experienceOutcome(candidate: CandidateFacts, value: string): RequirementOutcome {
  const years = /^(\\d+) years?$/i.exec(value)?.[1];
  if (!years) return "cant_tell";
  const requiredMonths = Number(years) * 12;
  if (candidate.knownEmploymentMonths >= requiredMonths) return "met";
  return candidate.unknownEmploymentSourcePaths.length ? "cant_tell" : "not_met";
}

export function evaluateRequirement(candidate: CandidateFacts, requirement: JobRequirement) {
  const evidence: string[] = [];
  let outcome: RequirementOutcome = "cant_tell";
  const value = normalise(requirement.value);

  if (requirement.category === "skill") {
    const match = candidate.skills.find((item) => item.canonical &&
      skillKey(item.canonical) === skillKey(requirement.value));
    if (match) evidence.push(match.sourcePath);
    if (match) outcome = "met";
  } else if (requirement.category === "experience") {
    outcome = experienceOutcome(candidate, requirement.value);
    if (outcome !== "cant_tell") evidence.push("workExperience");
  } else if (requirement.category === "language") {
    const match = candidate.languages.find((item) => normalise(item.value) === value);
    if (match) evidence.push(match.sourcePath);
    if (match) outcome = "met";
  } else if (requirement.category === "certification") {
    const match = candidate.certifications.find((item) => normalise(item.name) === value);
    if (match) evidence.push(match.sourcePath);
    if (match) outcome = "met";
  } else if (requirement.category === "education") {
    const aliases = ["matric", "grade 12", "national senior certificate", "nsc"];
    const schoolRequirement = aliases.includes(value);
    const match = candidate.education.find((item) => {
      const qualification = normalise(item.qualification);
      if (schoolRequirement) return aliases.some((alias) => qualification.includes(alias));
      if (value === "diploma") return /\\bdiploma\\b/.test(qualification);
      if (value === "degree") return /\\bdegree\\b/.test(qualification);
      return qualification === value;
    });
    if (match) evidence.push(match.sourcePath);
    if (match) outcome = "met";
  }
  return { outcome, profileEvidence: evidence };
}
