"use client";

import { ArrowLeft } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { JobDetailActions } from "./job-detail-actions";
import { JobDetailPresentation, JobDetailEmptyState } from "../shared/job-detail-presentation";

type JobSource = { id: string; provider_key: string; provider_kind: string; external_job_id: string; source_url: string | null; application_url: string | null; published_at: string | null; availability_status: string };
type Job = {
  id: string; title: string; employer_name: string | null; description: string | null; location_text: string | null; country_code: string | null;
  work_mode: "onsite" | "hybrid" | "remote" | "unknown" | null; employment_type: string | null; salary_min: number | null; salary_max: number | null;
  salary_currency: string | null; updated_at: string | null; job_sources: JobSource[] | JobSource | null; state: "saved" | "dismissed" | null;
};
type Props = {
  job: Job | null; source: JobSource | null; applicationDestination: string | null; applicationUrl: string | null; jobSourceUrl: string | null;
  busy: boolean; detailLoading: boolean; mobileDetail: boolean; activityError: string | null; detailError: string | null;
  formatDate: (value: string | null | undefined) => string | null; onBack: () => void; onViewMatch: () => void;
  onApply: () => void; onSave: () => void; onDismiss: () => void; onRetry: () => void;
};

export function AuthenticatedJobDetailPanel({ job, source, applicationDestination, applicationUrl, jobSourceUrl, busy, detailLoading, mobileDetail, activityError, detailError, formatDate, onBack, onViewMatch, onApply, onSave, onDismiss, onRetry }: Props) {
  return (
    <Box component="section" className={`th-jobs-detail-panel th-jobs-redesign-detail ${mobileDetail ? "th-jobs-mobile-visible" : ""}`} aria-label="Selected job details" aria-busy={detailLoading}
      sx={{
        position: "sticky", top: 1.5, alignSelf: "start", minWidth: 0, minHeight: 0,
        height: "100%", maxHeight: "calc(100dvh - var(--th-app-header-height, 72px) - 42px)",
        overflowY: "auto", p: 2.5, border: 1, borderColor: "divider", borderRadius: 2,
        bgcolor: "background.paper", boxShadow: 1,
        "& > .th-jobs-detail-content": { overflowY: "auto", p: "4px 2px 12px" },
        "@media (max-width: 1100px) and (min-width: 761px)": { maxHeight: "calc(100dvh - var(--th-app-header-height, 72px) - 42px)", p: 2 },
        "@media (max-width: 760px)": {
          position: "static", height: "auto", maxHeight: "none", p: 1.75,
          borderRadius: 1.75, boxShadow: "none",
          "& > .th-jobs-detail-content": { overflow: "visible" },
        },
      }}
    >
      {!job ? <JobDetailEmptyState /> : <JobDetailPresentation job={job} postedAt={source?.published_at || null} formatDate={formatDate}
        beforeContent={<Button variant="text" size="small" className="th-jobs-mobile-back" onClick={onBack}><ArrowLeft size={17} aria-hidden="true" /> Back to results</Button>}
        headingAction={<Stack className="th-jobs-match-scorebox" spacing={0.5} sx={{ alignItems: "flex-start" }}>
          <Typography variant="caption">Match</Typography><Typography component="strong" sx={{ fontWeight: 700 }}>—</Typography>
          <Button variant="text" size="small" onClick={onViewMatch}>View breakdown</Button>
        </Stack>}
        actions={<Stack spacing={1}>
          <JobDetailActions job={job} applicationDestination={applicationDestination} applicationUrl={applicationUrl} jobSourceUrl={jobSourceUrl} busy={busy} detailLoading={detailLoading} onApply={onApply} onSave={onSave} onDismiss={onDismiss} />
          {activityError && <Typography color="error" variant="body2" role="status">{activityError}</Typography>}
          {detailError && <Stack direction="row" spacing={1} role="status" sx={{ alignItems: "center" }}>
            <Typography color="error" variant="body2">{detailError}</Typography><Button variant="outlined" size="small" onClick={onRetry}>Retry</Button>
          </Stack>}
          <Box className="th-jobs-source-status"><Typography component="span" variant="caption" data-available={Boolean(applicationUrl)}>{applicationUrl ? "✓ Application destination available" : "! Employer application link not verified"}</Typography></Box>
        </Stack>}
      />}
    </Box>
  );
}
