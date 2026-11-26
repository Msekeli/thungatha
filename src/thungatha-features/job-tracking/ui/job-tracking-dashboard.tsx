"use client";

import { useState } from "react";
import { BriefcaseBusiness, CalendarClock, CheckCircle2, Plus, Send, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationEmptyState } from "./application-empty-state";
import { ApplicationFilters } from "./application-filters";
import { ApplicationStatCard } from "./application-stat-card";
import { RecordApplicationDialog } from "./record-application-dialog";

const stats = [
  { label: "Total applications", value: 0, description: "All roles you have recorded", icon: BriefcaseBusiness },
  { label: "Awaiting response", value: 0, description: "Submitted and under review", icon: Send },
  { label: "Upcoming interviews", value: 0, description: "Interviews on your calendar", icon: CalendarClock },
  { label: "Offers received", value: 0, description: "Offers to review", icon: Trophy },
];

export function JobTrackingDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [query, setQuery] = useState("");

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">APPLICATION WORKSPACE</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Your applications</h2>
            <p className="mt-1 text-sm text-muted-foreground">Track progress from submission to final outcome.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}><Plus data-icon="inline-start" />Record an application</Button>
        </section>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Application overview">
          {stats.map((item) => <ApplicationStatCard key={item.label} {...item} />)}
        </section>
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><h3 className="font-semibold text-card-foreground">Application pipeline</h3><p className="mt-1 text-xs text-muted-foreground">A view of where each application stands.</p></div>
            <CheckCircle2 aria-hidden="true" className="size-5 text-muted-foreground" />
          </div>
          <ApplicationFilters selected={selectedFilter} onSelect={setSelectedFilter} query={query} onQueryChange={setQuery} />
          <div className="mt-5">
            <ApplicationEmptyState onRecord={() => setDialogOpen(true)} />
          </div>
        </section>
        <p className="text-center text-xs text-muted-foreground">Application records will appear here after you add them.</p>
      </div>
      <RecordApplicationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
