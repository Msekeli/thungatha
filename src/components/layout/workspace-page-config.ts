type WorkspacePage = { title: string; subtitle: string };

const workspacePages: Record<string, WorkspacePage> = {
  "/jobs": {
    title: "Job Discovery",
    subtitle: "Explore real opportunities. Choose your next step.",
  },
  "/cv-studio": {
    title: "CV Studio",
    subtitle: "Build and tailor your CV with confidence.",
  },
  "/job-tracking": {
    title: "Job Tracking",
    subtitle: "Keep your applications organised and moving forward.",
  },
  "/profile": {
    title: "Profile",
    subtitle: "Manage the professional information used across Thungatha.",
  },
  "/account": {
    title: "Account settings",
    subtitle: "Manage your preferences and account settings.",
  },
};

export function resolveWorkspacePage(active: string, status: string | null) {
  const jobsStatus =
    active === "/jobs" && (status === "saved" || status === "dismissed")
      ? status
      : null;
  const page =
    jobsStatus === "saved"
      ? {
          title: "Saved Jobs",
          subtitle: "Opportunities you have saved for later.",
        }
      : jobsStatus === "dismissed"
        ? {
            title: "Dismissed Jobs",
            subtitle: "Opportunities you have chosen to hide.",
          }
        : (workspacePages[active] ?? workspacePages["/jobs"]);
  return {
    page,
    activeDestination: jobsStatus ? `/jobs?status=${jobsStatus}` : active,
  };
}
