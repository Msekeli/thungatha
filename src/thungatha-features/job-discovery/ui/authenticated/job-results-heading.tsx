import { JobDiscoveryResultsSummary } from "../shared/job-discovery-results-summary";

export function JobResultsHeading({
  loading,
  count,
  total,
}: {
  loading: boolean;
  count: number;
  total: number;
}) {
  const label = loading
    ? "Updating opportunities…"
    : count === 0
      ? "0 opportunities"
      : `1–${Math.min(count, total).toLocaleString()} of ${total.toLocaleString()} opportunities`;
  return (
    <JobDiscoveryResultsSummary
      label={label}
      secondary="Official-source listings"
    />
  );
}
