import { NextRequest, NextResponse } from "next/server";
import { AiProviderError } from "@/lib/ai/errors";
import { cvContentSchema } from "@/thungatha-features/cv-studio/server/cv-studio-schema";
import {
  generateCvTailoringSuggestionsFromUnderstanding,
  type CvTailoringJob,
} from "@/thungatha-features/cv-studio/server/cv-tailoring-service";
import type { JobUnderstanding } from "@/thungatha-features/job-discovery/server/job-ai-schemas";

const sampleMasterCv = cvContentSchema.parse({
  fullName: "Alex Morgan",
  headline: "Frontend Developer",
  email: "alex.morgan@example.test",
  phone: null,
  location: "Cape Town, South Africa",
  linkedinUrl: null,
  portfolioUrl: null,
  professionalSummary:
    "Frontend developer with experience building responsive web interfaces using React and TypeScript. Comfortable collaborating with designers and backend developers.",
  workExperience: [
    {
      sourceId: "sample-role-1",
      jobTitle: "Junior Frontend Developer",
      employer: "Example Digital Studio",
      location: "Cape Town",
      startDate: "2023",
      endDate: null,
      isCurrent: true,
      description:
        "Built and maintained responsive web pages using React and TypeScript. Worked with backend developers to integrate REST API endpoints.",
      achievements: [
        "Improved reusable UI components and fixed interface defects.",
      ],
    },
  ],
  projects: [],
  technicalSkills: ["React", "TypeScript", "JavaScript", "CSS", "Git"],
  education: [],
  certifications: [],
  languages: ["English"],
});

const scenarios: Record<
  string,
  { job: CvTailoringJob; understanding: JobUnderstanding }
> = {
  baseline: {
    job: {
      title: "Frontend Software Developer",
      company: "Sample Technology",
      location: "Cape Town",
      description: [
        "Build and maintain responsive web applications using React and TypeScript.",
        "Integrate REST APIs and collaborate with backend engineers.",
        "Write maintainable components and participate in code reviews.",
      ].join("\n"),
    },
    understanding: {
      summary:
        "The role focuses on React and TypeScript application development, API integration, and collaborative engineering practices.",
      responsibilities: [
        { id: "resp-1", statement: "Build and maintain responsive web applications.", sourceEvidenceRefs: ["job:segment:1"] },
        { id: "resp-2", statement: "Integrate REST APIs with backend services.", sourceEvidenceRefs: ["job:segment:2"] },
        { id: "resp-3", statement: "Write maintainable components and participate in code reviews.", sourceEvidenceRefs: ["job:segment:3"] },
      ],
      capabilities: [
        { id: "cap-1", name: "Frontend development", context: "React and TypeScript application development.", sourceEvidenceRefs: ["job:segment:1"] },
      ],
      requirements: [
        { id: "req-react-typescript", statement: "Experience building applications with React and TypeScript.", category: "technology", importance: "mandatory", sourceEvidenceRefs: ["job:segment:1"] },
        { id: "req-rest-api", statement: "Experience integrating REST APIs.", category: "skill", importance: "preferred", sourceEvidenceRefs: ["job:segment:2"] },
        { id: "req-code-reviews", statement: "Experience participating in code reviews.", category: "experience", importance: "preferred", sourceEvidenceRefs: ["job:segment:3"] },
      ],
      coverage: "complete",
    },
  },
  unsupported: {
    job: {
      title: "Senior Cloud Platform Engineer",
      company: "Sample Cloud Systems",
      location: "Cape Town",
      description: [
        "Build and maintain web applications using React and TypeScript.",
        "Deploy and operate production workloads on AWS infrastructure.",
        "Design and maintain Kubernetes clusters for container orchestration.",
        "Lead a team of software developers and own technical delivery.",
        "Bring at least five years of professional software engineering experience.",
      ].join("\n"),
    },
    understanding: {
      summary:
        "The role combines frontend development with cloud infrastructure, Kubernetes operations, team leadership, and substantial professional experience.",
      responsibilities: [
        { id: "resp-1", statement: "Build and maintain web applications.", sourceEvidenceRefs: ["job:segment:1"] },
        { id: "resp-2", statement: "Deploy and operate production workloads on AWS.", sourceEvidenceRefs: ["job:segment:2"] },
        { id: "resp-3", statement: "Design and maintain Kubernetes clusters.", sourceEvidenceRefs: ["job:segment:3"] },
        { id: "resp-4", statement: "Lead a software development team.", sourceEvidenceRefs: ["job:segment:4"] },
      ],
      capabilities: [
        { id: "cap-1", name: "Frontend development", context: "React and TypeScript application development.", sourceEvidenceRefs: ["job:segment:1"] },
        { id: "cap-2", name: "Cloud infrastructure", context: "AWS workload deployment and Kubernetes operations.", sourceEvidenceRefs: ["job:segment:2", "job:segment:3"] },
        { id: "cap-3", name: "Technical leadership", context: "Leading developers and owning technical delivery.", sourceEvidenceRefs: ["job:segment:4"] },
      ],
      requirements: [
        { id: "req-react-typescript", statement: "Experience building applications with React and TypeScript.", category: "technology", importance: "mandatory", sourceEvidenceRefs: ["job:segment:1"] },
        { id: "req-aws", statement: "Experience deploying and managing AWS infrastructure.", category: "technology", importance: "mandatory", sourceEvidenceRefs: ["job:segment:2"] },
        { id: "req-kubernetes", statement: "Experience designing and maintaining Kubernetes clusters.", category: "technology", importance: "mandatory", sourceEvidenceRefs: ["job:segment:3"] },
        { id: "req-leadership", statement: "Experience leading a software development team.", category: "experience", importance: "preferred", sourceEvidenceRefs: ["job:segment:4"] },
        { id: "req-five-years", statement: "At least five years of professional software engineering experience.", category: "experience", importance: "mandatory", sourceEvidenceRefs: ["job:segment:5"] },
      ],
      coverage: "complete",
    },
  },
};

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const scenarioName = request.nextUrl.searchParams.get("scenario") ?? "baseline";
  const scenario = scenarios[scenarioName];
  if (!scenario) {
    return NextResponse.json(
      { error: "Unknown scenario. Use baseline or unsupported." },
      { status: 400 },
    );
  }

  try {
    const result = await generateCvTailoringSuggestionsFromUnderstanding(
      sampleMasterCv,
      sampleMasterCv,
      scenario.job,
      scenario.understanding,
      "groq",
    );
    return NextResponse.json({
      test: "cv-tailoring",
      scenario: scenarioName,
      provider: result.provider,
      model: result.model,
      taskVersion: result.taskVersion,
      suggestions: result.suggestions,
      gaps: result.gaps,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "CV tailoring test failed.";
    return NextResponse.json(
      {
        error: message,
        ...(error instanceof AiProviderError && error.diagnostic
          ? { diagnostic: error.diagnostic }
          : {}),
      },
      { status: 502 },
    );
  }
}
