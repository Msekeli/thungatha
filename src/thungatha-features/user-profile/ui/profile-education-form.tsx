"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { UserProfileDto } from "../server/user-profile-schema";
type Education = UserProfileDto["education"][number];
const levels = ["Below Grade 12", "Grade 12 (Matric) — NQF Level 4", "Certificate", "Higher Certificate", "Diploma", "Advanced Certificate", "Advanced Diploma", "Bachelor's Degree", "Honours Degree", "Postgraduate Diploma", "Master's Degree", "Doctoral Degree", "Other"];
const fields = ["Agriculture", "Computer Science", "Information Technology", "Software Development", "Business Management", "Accounting and Finance", "Engineering", "Education", "Healthcare", "Law", "Marketing", "Science", "Humanities and Social Sciences", "Other"];
export function ProfileEducationForm({ value, onChange, onSave, onCancel, editing }: { value: Education; onChange: (value: Education) => void; onSave: () => void; onCancel: () => void; editing: boolean }) {
  const set = (key: keyof Education, next: string | boolean) => {
    const updated = { ...value, [key]: typeof next === "boolean" ? next : next || null } as Education;
    if (key === "educationLevel" && (next === levels[0] || next === levels[1])) updated.fieldOfStudy = null;
    onChange(updated);
  };
  const noField = value.educationLevel === levels[0] || value.educationLevel === levels[1];
  return <form className="mt-4 space-y-4 rounded-lg border border-border bg-muted/40 p-4" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
    <label className="block space-y-2 text-sm font-medium">Education level <span className="text-destructive">(Required)</span><NativeSelect required value={value.educationLevel || ""} onChange={(e) => set("educationLevel", e.target.value)}><option value="">Select education level</option>{levels.map((level) => <option key={level}>{level}</option>)}</NativeSelect></label>
    <label className="block space-y-2 text-sm font-medium">Qualification name <span className="text-destructive">(Required)</span><Input required maxLength={150} value={value.qualification} onChange={(e) => set("qualification", e.target.value)} placeholder="e.g. Diploma in Software Development" /></label>
    <label className="block space-y-2 text-sm font-medium">Institution <span className="text-destructive">(Required)</span><Input required maxLength={150} value={value.institution} onChange={(e) => set("institution", e.target.value)} placeholder="College, university or school" /></label>
    {!noField && <label className="block space-y-2 text-sm font-medium">Field of study <span className="font-normal text-muted-foreground">(Optional where not applicable)</span><Input list="education-fields" value={value.fieldOfStudy || ""} onChange={(e) => set("fieldOfStudy", e.target.value)} placeholder="Search or enter your own" /><datalist id="education-fields">{fields.map((field) => <option key={field} value={field} />)}</datalist></label>}
    <div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-2 text-sm font-medium">Start month/year<Input type="month" value={value.startDate || ""} onChange={(e) => set("startDate", e.target.value)} /></label><label className="block space-y-2 text-sm font-medium">{value.isCurrent ? "Expected completion month/year" : "End month/year"}<Input type="month" value={value.endDate || ""} onChange={(e) => set("endDate", e.target.value)} /></label></div>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-0.5 size-4 accent-primary" checked={Boolean(value.isCurrent)} onChange={(e) => set("isCurrent", e.target.checked)} />I am currently studying here</label>
    <div className="flex flex-col gap-2 sm:flex-row"><Button type="submit" disabled={!value.educationLevel || !value.qualification.trim() || !value.institution.trim()}>{editing ? "Save changes" : "Save qualification"}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div>
  </form>;
}
