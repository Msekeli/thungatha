"use client";

import { BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  error?: string | null;
  loading: boolean;
  resultCount: number;
  onRetry?: () => void;
};

export function PublicJobDiscoveryResultState({ error, loading, resultCount, onRetry }: Props) {
  if (error) {
    return (
      <div className="th-discovery-empty">
        <p>{error}</p>
        <Button variant="secondary" size="sm" type="button" onClick={onRetry}>Try again</Button>
      </div>
    );
  }
  if (!loading && resultCount === 0) {
    return (
      <div className="th-discovery-empty">
        <BriefcaseBusiness size={25} />
        <strong>No matching jobs yet</strong>
        <p>Try changing your filters or search terms.</p>
      </div>
    );
  }
  if (loading) {
    return <div className="th-loading-rows"><span /><span /><span /><span /></div>;
  }
  return null;
}
