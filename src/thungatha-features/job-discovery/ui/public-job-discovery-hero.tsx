"use client";

import { ChevronDown, MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobSearchBar } from "./shared/job-search-bar";

type JobSuggestion = { title: string; employer_name: string | null };
type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  jobs: JobSuggestion[];
  quickType: string;
  onQuickTypeChange: (value: string) => void;
  onClearTypes: () => void;
  total: number;
  onOpenFilters: () => void;
};

const jobTypes = [
  { label: "All opportunities", value: "all" },
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Internships", value: "internship" },
  { label: "Learnerships", value: "learnership" },
  { label: "Graduate programmes", value: "graduate" },
];

export function PublicJobDiscoveryHero(props: Props) {
  const { query, onQueryChange, location, onLocationChange, jobs, quickType,
    onQuickTypeChange, onClearTypes, total, onOpenFilters } = props;
  const suggestions = jobs.flatMap((job) => [job.title, job.employer_name ?? ""]);

  return (
    <section className="th-discovery-hero">
      <div className="th-hero-glow" />
      <h1>Find your next <span>opportunity</span></h1>
      <p>Explore thousands of jobs in South Africa and beyond. Create an account to tailor
        <br className="th-hero-break" /> your CV, save jobs and track your applications.</p>
      <div className="th-hero-search">
        <div className="th-hero-query">
          <JobSearchBar value={query} onChange={onQueryChange}
            onSubmit={() => document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" })}
            placeholder="Job title, skills or company..." suggestions={suggestions} />
        </div>
        <div className="th-hero-location">
          <MapPin size={16} />
          <select aria-label="Search location" value={location}
            onChange={(event) => onLocationChange(event.target.value)}>
            <option>Cape Town + 50 km</option><option>Cape Town</option>
            <option>Johannesburg</option><option>Durban</option><option>Remote</option>
            <option value="">Anywhere</option>
          </select>
          <ChevronDown size={15} />
        </div>
        <Button variant="primary" className="th-hero-filter-button" type="button" onClick={onOpenFilters}>
          <SlidersHorizontal size={15} /> Filters
        </Button>
      </div>
      <div className="th-search-chips">
        {jobTypes.map((item) => (
          <Button key={item.value} variant="ghost" size="sm" type="button"
            data-active={quickType === item.value}
            onClick={() => {
              onQuickTypeChange(item.value);
              onClearTypes();
              document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}>
            {item.label}
            {item.value === "all" && <span className="th-quick-count">{total}</span>}
          </Button>
        ))}
      </div>
    </section>
  );
}
