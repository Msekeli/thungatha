"use client";

import type { JobDiscoveryWorkspaceProps } from "./job-discovery-workspace-types";
import { PublicJobDiscoveryWorkspace } from "../public/public-job-discovery-workspace";

export function JobDiscoveryWorkspace(props: JobDiscoveryWorkspaceProps) {
  return <PublicJobDiscoveryWorkspace data={props} />;
}
