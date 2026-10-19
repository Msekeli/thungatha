"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import "./public-job-discovery.css";
import { PublicJobDetailPanel } from "./public-job-detail-panel";
import { PublicJobPromo } from "./public-job-promo";
import { PublicJobMobileNav } from "./public-job-mobile-nav";
import { PublicJobMobileFilters } from "./public-job-mobile-filters";
import { PublicJobFiltersPanel } from "./public-job-filters-panel";
import { PublicJobDiscoveryHeader } from "./public-job-discovery-header";
import { PublicJobDiscoverySidebar } from "./public-job-discovery-sidebar";
import { PublicJobDiscoveryHero } from "./public-job-discovery-hero";
import { PublicJobDiscoveryResultsToolbar } from "./public-job-discovery-results-toolbar";
import { PublicJobDiscoveryJobList } from "./public-job-discovery-job-list";
import { PublicJobDiscoveryResultState } from "./public-job-discovery-result-state";
import { usePublicDismissedJobs } from "./use-public-dismissed-jobs";
import { usePublicJobFeed } from "./use-public-job-feed";
import { usePublicJobDetail } from "./use-public-job-detail";

import type { PublicJob as Job, PublicJobSource as JobSource } from "./public-job-types";
function sourceFor(job: Job | null): JobSource | null { if (!job?.job_sources) return null; return Array.isArray(job.job_sources) ? job.job_sources[0] ?? null : job.job_sources; }
function dateLabel(value: string | null | undefined): string { if (!value) return "Date unknown"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "Date unknown" : new Intl.DateTimeFormat("en-ZA", { year: "numeric", month: "short", day: "numeric" }).format(date); }


export default function PublicJobDiscovery({ configured }: { configured: boolean }) {
  const [query,setQuery]=useState(""); const [location,setLocation]=useState("Cape Town + 50 km");
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [typesSelected,setTypesSelected]=useState<string[]>([]); const [quickType,setQuickType]=useState("all"); const [modesSelected,setModesSelected]=useState<string[]>([]); const [sort,setSort]=useState("relevant"); const [salary,setSalary]=useState("any"); const [experience,setExperience]=useState("any");
  const [promoVisible,setPromoVisible]=useState(false); const [retry,setRetry]=useState(0); const [mobileFiltersOpen,setMobileFiltersOpen]=useState(false); const [mobileDetailOpen,setMobileDetailOpen]=useState(false); const { dismissedJobs, setDismissedJobs } = usePublicDismissedJobs(); const [showDismissed,setShowDismissed]=useState(false);
  const feed = usePublicJobFeed(query, location, retry, setSelectedId);
  const { jobs, total, loading, error } = feed;
  const { detail } = usePublicJobDetail(selectedId);

  function dismissJob(jobId:string){const job=jobs.find(item=>item.id===jobId) ?? (detail?.id===jobId ? detail : null);if(!job)return;setDismissedJobs(current=>[job,...current.filter(item=>item.id!==jobId)]);setSelectedId(current=>current===jobId?null:current);}
  function restoreJob(jobId:string){setDismissedJobs(current=>current.filter(item=>item.id!==jobId));setSelectedId(current=>current===jobId?null:current);}
  const filteredJobs=useMemo(()=>{let list=jobs.filter(j=>{const t=(j.employment_type||"").toLowerCase().replace(/[ -]+/g,"_"); const m=(j.work_mode||"").toLowerCase(); const salaryMatch=salary==="any"||(salary==="disclosed"?(j.salary_min!=null||j.salary_max!=null):salary==="above50"?(j.salary_min??j.salary_max??0)>=500000:true); return (typesSelected.length===0||typesSelected.includes(t))&&(quickType==="all"||t===quickType||((quickType==="learnership"||quickType==="graduate")&&t.includes(quickType)))&&(modesSelected.length===0||modesSelected.includes(m))&&salaryMatch;}); if(sort==="newest") list=[...list].sort((a,b)=>new Date(sourceFor(b)?.published_at||b.updated_at||0).getTime()-new Date(sourceFor(a)?.published_at||a.updated_at||0).getTime()); return list;},[jobs,typesSelected,quickType,modesSelected,salary,sort]);
  const selected=useMemo(()=>{const source=showDismissed?dismissedJobs:filteredJobs;const selectedJob=selectedId?source.find(j=>j.id===selectedId):null;if(selectedJob)return selectedJob;if(selectedId&&detail?.id===selectedId&&!showDismissed)return detail;return source[0]??null;},[showDismissed,dismissedJobs,filteredJobs,selectedId,detail]);
  useEffect(()=>{const timer=window.setTimeout(()=>{try{setPromoVisible(sessionStorage.getItem("th-public-promo-dismissed")!=="1");}catch{setPromoVisible(true);}},0);return()=>window.clearTimeout(timer);},[]);


  function dismissPromo(){setPromoVisible(false);try{sessionStorage.setItem("th-public-promo-dismissed","1");}catch{/* optional */}}
  const visibleJobs=showDismissed?dismissedJobs:filteredJobs.filter(job=>!dismissedJobs.some(item=>item.id===job.id));
  const hasActiveFilters=Boolean(query.trim()||location!=="Cape Town + 50 km"||typesSelected.length||quickType!=="all"||modesSelected.length||salary!=="any"||experience!=="any");
  function clearFilters(){setQuery("");setTypesSelected([]);setQuickType("all");setModesSelected([]);setSalary("any");setExperience("any");setLocation("Cape Town + 50 km");}
  const filterPanel=<PublicJobFiltersPanel query={query} setQuery={setQuery} location={location} setLocation={setLocation} typesSelected={typesSelected} setTypesSelected={setTypesSelected} modesSelected={modesSelected} setModesSelected={setModesSelected} salary={salary} setSalary={setSalary} experience={experience} setExperience={setExperience} onClose={() => setMobileFiltersOpen(false)} onClear={clearFilters}/>;
  return <Box className="th-discovery-shell" sx={{ minHeight: "100dvh", width: "100%", maxWidth: "100%", m: 0, bgcolor: "background.default", color: "text.primary", boxSizing: "border-box", "& *": { boxSizing: "border-box" } }}>
  <PublicJobDiscoveryHeader configured={configured} onOpenFilters={() => setMobileFiltersOpen(true)} />
  <PublicJobDiscoveryHero query={query} onQueryChange={setQuery} location={location} onLocationChange={setLocation} jobs={jobs} quickType={quickType} onQuickTypeChange={setQuickType} onClearTypes={() => setTypesSelected([])} total={total} onOpenFilters={() => setMobileFiltersOpen(true)} />
  <Box component="main" className="th-discovery-workspace" sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "205px minmax(0, 1fr)", xl: "250px minmax(370px, 0.95fr) minmax(420px, 1.05fr)" }, minWidth: 0, alignItems: "start" }}>
  <PublicJobDiscoverySidebar configured={configured} />
  <Box component="section" className="th-discovery-results" id="jobs" aria-label="Job results" sx={{ minWidth: 0, boxSizing: "border-box" }}><PublicJobDiscoveryResultsToolbar loading={loading&&!showDismissed} resultCount={visibleJobs.length} total={showDismissed?dismissedJobs.length:total} hasActiveFilters={hasActiveFilters} dismissedCount={dismissedJobs.length} showingDismissed={showDismissed} onToggleDismissed={()=>{setShowDismissed(value=>!value);setSelectedId(null);}} onClearFilters={clearFilters} sort={sort} onSortChange={setSort} query={query} onQueryChange={setQuery} jobs={jobs} onOpenFilters={() => setMobileFiltersOpen(true)} />
  <PublicJobDiscoveryResultState error={showDismissed?null:error} loading={loading&&!showDismissed} resultCount={visibleJobs.length} onRetry={() => setRetry((value) => value + 1)} showStatus />
  <PublicJobDiscoveryJobList jobs={visibleJobs.map((job) => ({ job, postedLabel: dateLabel(sourceFor(job)?.published_at) }))} selectedId={selectedId} configured={configured} dismissed={showDismissed} onDismiss={dismissJob} onRestore={restoreJob} onSelect={(jobId) => { setSelectedId(jobId); setMobileDetailOpen(true); }} /><PublicJobDiscoveryResultState loading={loading&&!showDismissed} resultCount={visibleJobs.length} showLoading />
  {promoVisible&&<PublicJobPromo configured={configured} variant="inline" onDismiss={dismissPromo} />}</Box>
  <PublicJobDetailPanel job={selected} configured={configured} mobileOpen={mobileDetailOpen} dismissed={Boolean(selected&&dismissedJobs.some(item=>item.id===selected.id))} onDismiss={()=>selected&&dismissJob(selected.id)} onRestore={()=>selected&&restoreJob(selected.id)} onBack={() => setMobileDetailOpen(false)}/></Box>{promoVisible&&<PublicJobPromo configured={configured} variant="wide" onDismiss={dismissPromo} /> }
  <PublicJobMobileNav configured={configured} />
  {mobileFiltersOpen&&<PublicJobMobileFilters onClose={() => setMobileFiltersOpen(false)}>{filterPanel}</PublicJobMobileFilters>}</Box>;
}
