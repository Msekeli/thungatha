"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export type ExperienceDraft = { title: string; employer: string; startDate: string; endDate: string; location: string; current: boolean; description: string };
const Required = () => <span className="font-normal text-destructive">(Required)</span>;
export function ProfileExperienceForm({ value, onChange, onSave, onCancel, editing }: { value: ExperienceDraft; onChange: (value: ExperienceDraft) => void; onSave: () => void; onCancel: () => void; editing: boolean }) {
  const set = (key: keyof ExperienceDraft, next: string | boolean) => onChange({ ...value, [key]: next, ...(key === "current" && next ? { endDate: "" } : {}) } as ExperienceDraft);
  return <form className="mt-4 space-y-4 rounded-lg border border-border bg-muted/40 p-4" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium">Job title <Required /><Input required value={value.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Software Engineer" /></label>
      <label className="space-y-2 text-sm font-medium">Employer <Required /><Input required value={value.employer} onChange={(e) => set("employer", e.target.value)} placeholder="Company or organisation" /></label>
      <label className="space-y-2 text-sm font-medium">Start date <Required /><Input required type="month" value={value.startDate} onChange={(e) => set("startDate", e.target.value)} /></label>
      <label className="space-y-2 text-sm font-medium">End date {value.current ? <span className="font-normal text-muted-foreground">(not needed for current role)</span> : <Required />}<Input required={!value.current} type="month" value={value.endDate} disabled={value.current} onChange={(e) => set("endDate", e.target.value)} /></label>
      <label className="space-y-2 text-sm font-medium sm:col-span-2">Location <span className="font-normal text-muted-foreground">(optional)</span><Input value={value.location} onChange={(e) => set("location", e.target.value)} placeholder="City, region or remote" /></label>
    </div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.current} onChange={(e) => set("current", e.target.checked)} className="size-4 rounded border-input accent-primary" />I currently work here</label>
    <label className="block space-y-2 text-sm font-medium">Responsibilities and achievements <span className="font-normal text-muted-foreground">(optional)</span><Textarea rows={3} maxLength={5000} value={value.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe your impact and responsibilities…" /></label>
    <div className="flex flex-col gap-2 sm:flex-row"><Button type="submit" disabled={!value.title.trim() || !value.employer.trim() || !value.startDate || (!value.current && !value.endDate)}>{editing ? "Save changes" : "Save role"}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div>
  </form>;
}
