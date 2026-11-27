"use client";

import { Button } from "@/components/ui/button";
import type { ReusableCv } from "./cv-studio-content-types";

export function CvStudioJobActions({
  reusableCv,
  busy,
  onStartTailoring,
  onReturnToMaster,
}: {
  reusableCv: ReusableCv | null;
  busy: boolean;
  onStartTailoring: () => void;
  onReturnToMaster: () => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {!reusableCv && (
        <Button
          size="lg"
          className="mx-auto w-[98%] rounded-md"
          disabled={busy}
          onClick={onStartTailoring}
        >
          <span className="font-bold">
            Create a new CV tailored to this job
          </span>
        </Button>
      )}
      {reusableCv && (
        <Button variant="outline" size="sm" onClick={onReturnToMaster}>
          Return to master CV
        </Button>
      )}
    </div>
  );
}
