"use client";

import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Plus,
  Send,
  Trophy,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { NativeSelect } from "@/components/ui/native-select";
import { ApplicationEmptyState } from "./application-empty-state";
import { ApplicationFilters } from "./application-filters";
import { ApplicationStatCard } from "./application-stat-card";
import { ApplicationList } from "./application-list";
import { RecordApplicationDialog } from "./record-application-dialog";
import { applicationStatuses, type ApplicationRecord, type ApplicationStatus } from "../types/application";

export function JobTrackingDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return applications.filter((application) => {
      const matchesStatus =
        selectedFilter === "All" || application.status === selectedFilter;
      const matchesQuery =
        !normalizedQuery ||
        application.company.toLocaleLowerCase().includes(normalizedQuery) ||
        application.jobTitle.toLocaleLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [applications, query, selectedFilter]);

  const activeCount = applications.filter((application) =>
    ["Submitted", "Under review"].includes(application.status),
  ).length;
  const interviewCount = applications.filter(
    (application) => application.status === "Interview",
  ).length;
  const offerCount = applications.filter(
    (application) => application.status === "Offer",
  ).length;

  function updateApplicationStatus(id: string, status: ApplicationStatus) {
    const changedAt = new Date().toISOString();
    const historyEntryId = crypto.randomUUID();
    const updateRecord = (application: ApplicationRecord): ApplicationRecord => {
      if (application.id !== id || application.status === status) return application;

      return {
        ...application,
        status,
        jobDescription:
          status === "Rejected" || status === "Withdrawn"
            ? ""
            : application.jobDescription,
        statusHistory: [
          ...application.statusHistory,
          {
            id: historyEntryId,
            fromStatus: application.status,
            toStatus: status,
            changedAt,
            actor: "user",
          },
        ],
      };
    };

    setApplications((current) => current.map(updateRecord));
    setSelectedApplication((current) => current ? updateRecord(current) : current);
  }

  function addApplication(application: Omit<ApplicationRecord, "id">) {
    setApplications((current) => [
      { ...application, id: crypto.randomUUID() },
      ...current,
    ]);
  }

  const stats = [
    {
      label: "Total applications",
      value: applications.length,
      description: "Roles recorded in this session",
      icon: BriefcaseBusiness,
    },
    {
      label: "Awaiting response",
      value: activeCount,
      description: "Submitted and under review",
      icon: Send,
    },
    {
      label: "Interviews",
      value: interviewCount,
      description: "Applications at interview stage",
      icon: CalendarClock,
    },
    {
      label: "Offers received",
      value: offerCount,
      description: "Offers to review",
      icon: Trophy,
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col gap-4 overflow-hidden px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 lg:px-8">
        <section className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">APPLICATION WORKSPACE</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Your applications
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Track progress from submission to final outcome.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus data-icon="inline-start" />
            Record an application
          </Button>
        </section>

        <section className="grid shrink-0 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Application overview">
          {stats.map((item) => (
            <ApplicationStatCard key={item.label} {...item} />
          ))}
        </section>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-card-foreground">Application pipeline</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                A view of where each application stands.
              </p>
            </div>
            <CheckCircle2 aria-hidden="true" className="size-5 text-muted-foreground" />
          </div>
          <div className="shrink-0">
            <ApplicationFilters
              selected={selectedFilter}
              onSelect={setSelectedFilter}
              query={query}
              onQueryChange={setQuery}
            />
          </div>
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            {applications.length === 0 ? (
              <ApplicationEmptyState onRecord={() => setDialogOpen(true)} />
            ) : filteredApplications.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center">
                <p className="font-medium text-foreground">No matching applications</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try another search term or choose a different status.
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setSelectedFilter("All");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <ApplicationList
                applications={filteredApplications}
                onOpen={setSelectedApplication}
              />
            )}
          </div>
        </section>
        <p className="shrink-0 text-center text-xs text-muted-foreground">
          Preview only — records are cleared when this page session ends.
        </p>
      </div>

      <RecordApplicationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={addApplication}
      />

      {selectedApplication && (
        <Modal
          title={selectedApplication.jobTitle}
          description={selectedApplication.company}
          onClose={() => setSelectedApplication(null)}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 aria-hidden="true" className="size-4" />
                {selectedApplication.company}
              </span>
              <div className="min-w-40">
                <label htmlFor="application-status" className="mb-1 block text-xs text-muted-foreground">Current status</label>
                <NativeSelect
                  id="application-status"
                  value={selectedApplication.status}
                  onChange={(event) => updateApplicationStatus(selectedApplication.id, event.target.value as ApplicationStatus)}
                >
                  {applicationStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <dl className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Application date</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {selectedApplication.applicationDate || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Source</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {selectedApplication.source || "Not provided"}
                </dd>
              </div>
            </dl>
            {selectedApplication.url && (
              <a
                href={selectedApplication.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Open application link
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            )}
            {(selectedApplication.status === "Rejected" || selectedApplication.status === "Withdrawn") && (
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                The full job description is cleared when an application is rejected or withdrawn. This preview applies that rule immediately.
              </p>
            )}
            {selectedApplication.jobDescription && (
              <div>
                <h4 className="text-sm font-semibold text-foreground">Job description</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {selectedApplication.jobDescription}
                </p>
              </div>
            )}
            <section aria-labelledby="application-history-heading">
              <div className="mb-3 flex items-center justify-between">
                <h4 id="application-history-heading" className="text-sm font-semibold text-foreground">Status history</h4>
                <span className="text-xs text-muted-foreground">{selectedApplication.statusHistory.length} {selectedApplication.statusHistory.length === 1 ? "event" : "events"}</span>
              </div>
              {selectedApplication.statusHistory.length > 0 ? (
                <ol className="space-y-3 border-l border-border pl-4">
                  {[...selectedApplication.statusHistory].reverse().map((entry) => (
                    <li key={entry.id} className="relative">
                      <span aria-hidden="true" className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-background bg-primary" />
                      <p className="text-sm font-medium text-foreground">
                        {entry.fromStatus ? entry.fromStatus + " → " + entry.toStatus : "Application recorded as " + entry.toStatus}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.changedAt))} · Updated by you
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No status changes recorded.</p>
              )}
            </section>
            {selectedApplication.notes && (
              <div>
                <h4 className="text-sm font-semibold text-foreground">Notes</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {selectedApplication.notes}
                </p>
              </div>
            )}
            <div className="flex justify-end border-t border-border pt-4">
              <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
