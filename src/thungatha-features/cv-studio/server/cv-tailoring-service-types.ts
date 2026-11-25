import type { AiProvider } from "@/lib/ai/contracts";

export type CvTailoringJob = {
  title: string;
  company: string | null;
  location: string | null;
  description: string;
};

export type CvTailoringProvider = Exclude<AiProvider, "ollama-cloud">;
export type CvEvidence = Array<{ id: string; content: string }>;
