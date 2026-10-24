"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { UserProfileDto } from "../server/user-profile-schema";

type Props = {
  filename: string;
  storagePath: string;
  onDone?: () => void;
};
type Extraction = {
  status: "success" | "partial" | "failed";
  extractedTextLength: number;
  fields: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    summary: string | null;
    skills: string[];
  };
  warnings: string[];
};
type Review = Pick<UserProfileDto, "personalDetails" | "summary" | "skills"> & {
  baseProfile: UserProfileDto;
};

function mergeProposal(profile: UserProfileDto, result: Extraction): Review {
  const current = profile.personalDetails;
  const fields = result.fields;
  return {
    baseProfile: profile,
    personalDetails: {
      ...current,
      fullName: current.fullName || fields.fullName,
      email: current.email || fields.email,
      phone: current.phone || fields.phone,
      linkedinUrl: current.linkedinUrl || fields.linkedinUrl,
      portfolioUrl: current.portfolioUrl || fields.portfolioUrl,
    },
    summary: profile.summary || fields.summary,
    skills: profile.skills.length ? profile.skills : fields.skills,
  };
}

export function ProfileCvExtraction({ filename, storagePath, onDone }: Props) {
  const [result, setResult] = useState<Extraction | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function extract() {
    setBusy(true);
    setError("");
    setMessage("");
    setResult(null);
    setReview(null);
    try {
      const response = await fetch("/api/profile/cv-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, storagePath }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "CV extraction failed.");
      const extraction = body.extraction as Extraction;
      setResult(extraction);
      if (extraction.status === "failed") return;
      const profileResponse = await fetch("/api/profile");
      const profileBody = await profileResponse.json();
      if (!profileResponse.ok || !profileBody.profile)
        throw new Error("Text was extracted, but your profile could not be loaded. Retry extraction.");
      setReview(mergeProposal(profileBody.profile as UserProfileDto, extraction));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void extract();
    // Extraction runs once for each successfully uploaded staged file.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filename, storagePath]);

  function updateDetails(key: keyof Review["personalDetails"], value: string) {
    if (!review) return;
    setReview({ ...review, personalDetails: { ...review.personalDetails, [key]: value || null } });
  }

  async function saveReview() {
    if (!review || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const profile = review.baseProfile;
      const payload = {
        ...profile,
        personalDetails: review.personalDetails,
        summary: review.summary,
        skills: review.skills,
        displayName: review.personalDetails.fullName || profile.displayName || undefined,
        confirmedAt: new Date().toISOString(),
      };
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Your profile could not be saved.");
      setMessage("Profile details confirmed and saved.");
      onDone?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (busy) return <p role="status" className="mt-4 rounded-lg border border-line p-4 text-sm text-fg-muted">Reading your CV and preparing your profile review…</p>;

  return (
    <div className="mt-4 space-y-4">
      {error && <p role="alert" className="rounded-lg border border-warn/40 p-3 text-sm text-warn">{error}</p>}
      {result?.status === "failed" && (
        <div className="rounded-lg border border-warn/40 p-4">
          <p className="font-medium text-fg">We couldn’t read enough information from this CV.</p>
          {result.warnings.map((warning) => <p key={warning} className="mt-2 text-sm text-fg-muted">{warning}</p>)}
          <Button className="mt-3" type="button" onClick={() => void extract()}>Retry extraction</Button>
        </div>
      )}
      {review && result && (
        <section className="space-y-4 rounded-xl border border-line bg-panel p-4 sm:p-5">
          <div>
            <p className="text-sm font-semibold text-fg">Review your profile details</p>
            <p className="mt-1 text-xs text-fg-muted">We’ve filled in what we could find. Check every field and correct anything that is wrong. Existing saved details have been preserved.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["fullName", "Full name", "Name not found in CV"],
              ["email", "Email", "Email not found in CV"],
              ["phone", "Phone", "Phone not found in CV"],
              ["linkedinUrl", "LinkedIn URL", "LinkedIn URL not found in CV"],
              ["portfolioUrl", "Portfolio URL", "Portfolio URL not found in CV"],
            ] as const).map(([key, label, placeholder]) => (
              <label key={key} className="block text-xs font-medium text-fg-muted">
                {label}
                <input value={review.personalDetails[key] || ""} placeholder={placeholder} onChange={(event) => updateDetails(key, event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
              </label>
            ))}
          </div>
          <label className="block text-xs font-medium text-fg-muted">Professional summary
            <textarea rows={5} value={review.summary || ""} placeholder="Summary not found in CV — add one if you wish." onChange={(event) => setReview({ ...review, summary: event.target.value || null })} className="mt-1 w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
          </label>
          <label className="block text-xs font-medium text-fg-muted">Skills (separate each skill with a comma)
            <textarea rows={3} value={review.skills.join(", ")} placeholder="Skills not found in a recognisable section" onChange={(event) => setReview({ ...review, skills: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} className="mt-1 w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
          </label>
          <div className="rounded-lg bg-panel-2 p-3 text-xs text-fg-muted">
            {result.extractedTextLength.toLocaleString()} characters read. Work experience and education were not reliably extracted; you can add those in the profile editor after saving. Nothing from this review is saved until you confirm.
          </div>
          {result.warnings.map((warning) => <p key={warning} className="text-xs text-warn">{warning}</p>)}
          {message && <p role="status" className="text-sm text-accent">{message}</p>}
          <Button type="button" disabled={saving} onClick={() => void saveReview()}>{saving ? "Saving profile…" : "Confirm and save profile"}</Button>
        </section>
      )}
    </div>
  );
}
