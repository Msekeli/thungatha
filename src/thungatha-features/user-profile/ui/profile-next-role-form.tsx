"use client";
import { Input } from "@/components/ui/input";
const suggestedRoles = ["Software Engineer", "Software Developer", "Frontend Developer", "Backend Developer", "Full-Stack Developer", "QA Engineer", "Data Analyst", "Business Analyst", "Product Designer", "Project Manager", "Accountant", "Finance Analyst", "HR Specialist", "Marketing Specialist", "Sales Representative", "Operations Coordinator"];
export function ProfileNextRoleForm({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) {
  return <section className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
    <h2 className="text-base font-semibold">What’s your next role?</h2>
    <p className="mt-1 text-sm text-muted-foreground">Choose a suggested title or type your own. This is optional and helps surface relevant opportunities without excluding related roles.</p>
    <label htmlFor="next-role" className="mt-4 block space-y-2 text-sm font-medium">Preferred job title <span className="font-normal text-muted-foreground">(optional)</span>
      <Input id="next-role" list="thungatha-role-suggestions" value={value ?? ""} onChange={(event) => onChange(event.target.value || null)} placeholder="e.g. Software Engineer" maxLength={150} autoComplete="organization-title" />
    </label>
    <datalist id="thungatha-role-suggestions">{suggestedRoles.map((role) => <option key={role} value={role} />)}</datalist>
  </section>;
}
