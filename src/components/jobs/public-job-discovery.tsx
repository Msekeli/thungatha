"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileUser,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { HomeAuthActions } from "@/components/auth/home-auth-actions";
import "./public-job-discovery.css";

type JobSource = {
  source_url: string | null;
  application_url: string | null;
  published_at: string | null;
  availability_status: string;
  provider_kind: string;
};
type Job = {
  id: string;
  title: string;
  employer_name: string | null;
  description: string | null;
  location_text: string | null;
  country_code: string | null;
  work_mode: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  updated_at: string | null;
  job_sources: JobSource[] | JobSource | null;
  state: "saved" | "dismissed" | null;
};
type Feed = { jobs: Job[]; page: number; pageSize: number; total: number; totalPages: number };

function sourceFor(job: Job | null): JobSource | null {
  if (!job?.job_sources) return null;
  return Array.isArray(job.job_sources) ? job.job_sources[0] ?? null : job.job_sources;
}
function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch { return null; }
}
function dateLabel(value: string | null | undefined): string {
  if (!value) return "Recently listed";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently listed" : new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short" }).format(date);
}
function salaryLabel(job: Job): string | null {
  if (job.salary_min == null && job.salary_max == null) return null;
  const currency = job.salary_currency || "ZAR";
  const format = (n: number) => new Intl.NumberFormat("en-ZA", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  if (job.salary_min != null && job.salary_max != null) return `${format(job.salary_min)} – ${format(job.salary_max)}`;
  return format((job.salary_min ?? job.salary_max)!);
}

const featureLinks = [
  { href: "/cv-studio", icon: FileUser, title: "Tailor your CV", description: "Adapt your CV to the role without inventing experience." },
  { href: "/applications", icon: TrendingUp, title: "Track applications", description: "Keep deadlines, interviews and follow-ups together." },
  { href: "/jobs?status=saved", icon: Bookmark, title: "Save jobs", description: "Build a shortlist of roles worth pursuing." },
];

export default function PublicJobDiscovery({ configured }: { configured: boolean }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoVisible, setPromoVisible] = useState(false);
  const [page, setPage] = useState(1);\n  const [retry, setRetry] = useState(0);
  const selected = useMemo(() => jobs.find((job) => job.id === selectedId) ?? detail ?? jobs[0] ?? null, [jobs, selectedId, detail]);

  useEffect(() => {
    try { setPromoVisible(sessionStorage.getItem("th-public-promo-dismissed") !== "1"); }
    catch { setPromoVisible(true); }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: String(page), pageSize: "30", publishedWithin: "30d" });
      if (query.trim()) params.set("query", query.trim());
      if (location.trim()) params.set("location", location.trim());
      if (workMode) params.set("workMode", workMode);
      try {
        const response = await fetch(`/api/jobs?${params}`, { signal: controller.signal, cache: "no-store", headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(response.status === 503 ? "Job Discovery is temporarily unavailable. Please try again shortly." : "We couldn't load jobs right now. Please try again.");
        const data = await response.json() as Feed;
        if (!Array.isArray(data.jobs)) throw new Error("The jobs service returned an unexpected response.");
        setJobs(data.jobs);
        setTotal(data.total);
        setSelectedId((current) => current && data.jobs.some((job) => job.id === current) ? current : data.jobs[0]?.id ?? null);
      } catch (reason) {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "We couldn't load jobs right now.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, location, workMode, page, retry]);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    const controller = new AbortController();
    fetch(`/api/jobs/${encodeURIComponent(selectedId)}`, { signal: controller.signal, cache: "no-store", headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error("This listing is no longer available.");
        const payload = await response.json() as { job: Job };
        setDetail(payload.job);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== "AbortError") setDetail(null);
      });
    return () => controller.abort();
  }, [selectedId]);

  function dismissPromo() {
    setPromoVisible(false);
    try { sessionStorage.setItem("th-public-promo-dismissed", "1"); } catch { /* session storage is optional */ }
  }

  const source = sourceFor(selected);
  const applyUrl = safeUrl(source?.application_url) ?? safeUrl(source?.source_url);
  const description = selected?.description?.trim();

  return (
    <div className="th-public-page min-h-screen bg-page text-fg">
      <div aria-hidden="true" className="th-public-hero-bg th-hero-bg pointer-events-none absolute inset-x-0 top-0 h-[560px]" />
      <header className="th-public-header relative">
        <div className="th-public-header-inner">
          <BrandMark />
          <nav aria-label="Main navigation" className="th-public-nav">
            <a href="#jobs" className="th-public-nav-active">Discover jobs</a>
            <a href="#features">What you can do</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <HomeAuthActions configured={configured} variant="nav" />
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="th-public-hero">
          <div className="th-public-eyebrow"><Sparkles size={14} /> A more considered job search</div>
          <h1>Find your next move.<br /><span>Make every application count.</span></h1>
          <p>Discover opportunities, tailor your CV with confidence, and keep your applications organised — all in one place.</p>
          <form className="th-public-search" onSubmit={(event) => { event.preventDefault(); setPage(1); document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
            <label className="th-public-search-field"><Search size={18} /><span className="sr-only">Job title or company</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Job title, skill or company" /></label>
            <label className="th-public-search-field"><MapPin size={18} /><span className="sr-only">Location</span><input value={location} onChange={(event) => { setLocation(event.target.value); setPage(1); }} placeholder="City or remote" /></label>
            <button className="th-public-search-button" type="submit"><Search size={17} /> Find jobs</button>
          </form>
          <div className="th-public-hero-note"><CheckCircle2 size={15} /> Browse freely. No account needed to apply on the employer's site.</div>
        </section>

        <section id="jobs" className="th-public-jobs-section">
          <div className="th-public-section-heading">
            <div><span className="th-tag" data-tone="accent">JOB DISCOVERY</span><h2>Opportunities to explore</h2><p>Find roles that fit the next step you want to take.</p></div>
            <label className="th-public-workmode"><SlidersHorizontal size={16} /><span className="sr-only">Work arrangement</span><select value={workMode} onChange={(event) => { setWorkMode(event.target.value); setPage(1); }}><option value="">All work arrangements</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label>
          </div>

          <div className="th-public-job-layout">
            <section className="th-public-results th-panel" aria-label="Job results">
              <div className="th-public-results-heading"><span>{loading ? "Finding opportunities…" : `${total.toLocaleString()} opportunities`}</span><span>Recently listed</span></div>
              {error ? <div className="th-public-empty"><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button></div> : null}
              {!error && !loading && jobs.length === 0 ? <div className="th-public-empty"><BriefcaseBusiness size={25} /><strong>No matching jobs yet</strong><p>Try a different job title, location or work arrangement.</p></div> : null}
              {jobs.map((job) => {
                const jobSource = sourceFor(job);
                return <button type="button" key={job.id} className="th-public-job-card" data-selected={selectedId === job.id} onClick={() => setSelectedId(job.id)}>
                  <span className="th-public-company-mark">{(job.employer_name || job.title).slice(0, 1).toUpperCase()}</span>
                  <span className="th-public-job-copy"><strong>{job.title}</strong><span>{job.employer_name || "Employer not listed"}</span><span className="th-public-job-meta"><MapPin size={13} />{job.location_text || (job.work_mode === "remote" ? "Remote" : "Location not specified")}<span>·</span>{job.work_mode === "remote" ? "Remote" : job.work_mode === "hybrid" ? "Hybrid" : job.work_mode === "onsite" ? "On-site" : "Work mode not specified"}</span><span className="th-public-job-meta"><CalendarClock size={13} />{dateLabel(jobSource?.published_at)}{salaryLabel(job) ? <><span>·</span>{salaryLabel(job)}</> : null}</span></span>
                  <ChevronRight size={17} className="th-public-job-chevron" />
                </button>;
              })}
              {loading ? <div className="th-public-loading"><span /><span /><span /></div> : null}
            </section>

            <aside className="th-public-detail th-panel" aria-label="Selected job details">
              {selected ? <>
                <div className="th-public-detail-top"><span className="th-public-company-mark th-public-company-mark-large">{(selected.employer_name || selected.title).slice(0, 1).toUpperCase()}</span><span className="th-tag" data-tone="success">Active listing</span></div>
                <h2>{selected.title}</h2><p className="th-public-detail-company">{selected.employer_name || "Employer not listed"}</p>
                <div className="th-public-detail-facts"><span><MapPin size={15} />{selected.location_text || "Location not specified"}</span><span><BriefcaseBusiness size={15} />{selected.employment_type?.replace(/[_-]+/g, " ") || "Employment type not specified"}</span>{salaryLabel(selected) ? <span>{salaryLabel(selected)}</span> : null}</div>
                <div className="th-public-detail-actions">
                  {applyUrl ? <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="th-public-apply">Apply on employer site <ExternalLink size={15} /></a> : <p className="th-public-no-apply">An official application link is not available for this listing yet.</p>}
                  <Link href={`/sign-in?redirect_url=${encodeURIComponent("/jobs")}`} className="th-public-save"><Bookmark size={16} /> Save job <span>Sign in</span></Link>
                </div>
                <div className="th-public-description"><h3>About this role</h3>{description ? <div className="th-public-description-body">{description}</div> : <p>The employer has not supplied a full description for this listing.</p>}</div>
                {source?.source_url ? <a className="th-public-source-link" href={safeUrl(source.source_url) ?? "#"} target="_blank" rel="noopener noreferrer">View original listing <ExternalLink size={13} /></a> : null}
              </> : <div className="th-public-empty th-public-detail-empty"><BriefcaseBusiness size={26} /><strong>Select a role to see details</strong><p>Choose a job from the list to review the description and application destination.</p></div>}
            </aside>
          </div>
        </section>

        {promoVisible ? <aside className="th-public-promo" aria-label="Create a Thungatha account"><button type="button" className="th-public-promo-close" aria-label="Dismiss account promotion" onClick={dismissPromo}><X size={16} /></button><span className="th-public-promo-icon"><Sparkles size={18} /></span><div><strong>Make your job search work harder.</strong><p>Create a free account to tailor your CV, save roles and track applications in one place.</p></div><Link href="/sign-up" className="th-public-promo-cta">Get started <ArrowDownRight size={15} /></Link></aside> : null}
        <section id="features" className="th-public-features">
          <div className="th-public-feature-intro"><span className="th-tag" data-tone="accent">MORE THAN A JOB BOARD</span><h2>Everything around the application, too.</h2><p>Explore jobs freely. Sign in when you're ready to organise your search and make the most of your next move.</p></div>
          <div className="th-public-feature-grid">{featureLinks.map((feature) => { const Icon = feature.icon; return <Link href={feature.href} key={feature.title} className="th-public-feature-card"><span className="th-public-feature-icon"><Icon size={21} /></span><h3>{feature.title}</h3><p>{feature.description}</p><span className="th-public-feature-link">Explore feature <ArrowRight size={15} /></span></Link>; })}</div>
        </section>

      </main>

      <footer className="th-public-footer"><BrandMark /><span>Discover with purpose. Apply with confidence.</span><a href="#jobs">Back to jobs ↑</a></footer>
    </div>
  );
}
