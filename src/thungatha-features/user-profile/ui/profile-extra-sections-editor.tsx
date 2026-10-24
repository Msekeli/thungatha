"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";

type Cert = UserProfileDto["certifications"][number];
type Proj = UserProfileDto["projects"][number];

export function ProfileExtraSectionsEditor({
  certifications,
  projects,
  onCertsChange,
  onProjectsChange,
}: {
  certifications: Cert[];
  projects: Proj[];
  onCertsChange: (certs: Cert[]) => void;
  onProjectsChange: (projs: Proj[]) => void;
}) {
  const [cert, setCert] = useState("");
  const [proj, setProj] = useState("");

  const addCert = () => {
    if (!cert.trim()) return;
    onCertsChange([...certifications, { id: `c-${Date.now()}`, name: cert.trim() }]);
    setCert("");
  };
  const addProj = () => {
    if (!proj.trim()) return;
    onProjectsChange([...projects, { id: `p-${Date.now()}`, name: proj.trim() }]);
    setProj("");
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-line bg-panel p-5">
        <h2 className="text-sm font-semibold text-fg">Certifications</h2>
        <div className="mt-3 divide-y divide-line/40">
          {certifications.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-1.5 text-xs text-fg">
              <span>{c.name}</span>
              <div className="flex gap-2"><button type="button" onClick={() => {
                const name = window.prompt("Certification name", c.name); if (name === null) return;
                const issuer = window.prompt("Issuing organisation (optional)", c.issuer || ""); if (issuer === null) return;
                const issueDate = window.prompt("Issue date (optional)", c.issueDate || ""); if (issueDate === null) return;
                const expiryDate = window.prompt("Expiry date (optional)", c.expiryDate || ""); if (expiryDate === null) return;
                onCertsChange(certifications.map((entry) => entry.id === c.id ? { ...entry, name, issuer: issuer || null, issueDate: issueDate || null, expiryDate: expiryDate || null } : entry));
              }} className="text-accent hover:underline">Edit</button><button type="button" onClick={() => onCertsChange(certifications.filter((i) => i.id !== c.id))} className="text-warn hover:underline">Remove</button></div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input placeholder="Certification name" value={cert} onChange={(e) => setCert(e.target.value)} className="w-full rounded border border-line bg-panel-2 px-2.5 py-1 text-xs text-fg" />
          <Button type="button" size="xs" variant="secondary" onClick={addCert}>Add</Button>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-panel p-5">
        <h2 className="text-sm font-semibold text-fg">Projects</h2>
        <div className="mt-3 divide-y divide-line/40">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-1.5 text-xs text-fg">
              <span>{p.name}</span>
              <div className="flex gap-2"><button type="button" onClick={() => {
                const name = window.prompt("Project name", p.name); if (name === null) return;
                const description = window.prompt("Project description (optional)", p.description || ""); if (description === null) return;
                const role = window.prompt("Role / contribution (optional)", p.role || ""); if (role === null) return;
                const url = window.prompt("Project URL (optional)", p.url || ""); if (url === null) return;
                onProjectsChange(projects.map((entry) => entry.id === p.id ? { ...entry, name, description: description || null, role: role || null, url: url || null } : entry));
              }} className="text-accent hover:underline">Edit</button><button type="button" onClick={() => onProjectsChange(projects.filter((i) => i.id !== p.id))} className="text-warn hover:underline">Remove</button></div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input placeholder="Project name" value={proj} onChange={(e) => setProj(e.target.value)} className="w-full rounded border border-line bg-panel-2 px-2.5 py-1 text-xs text-fg" />
          <Button type="button" size="xs" variant="secondary" onClick={addProj}>Add</Button>
        </div>
      </div>
    </div>
  );
}
