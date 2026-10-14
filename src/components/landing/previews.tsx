// CSS-only illustrations built from existing component classes (components.css).
// All content is sample data and is labelled as such where it is shown.

function Req({
  label,
  evidence,
  state,
  text,
}: {
  label: string;
  evidence: string;
  state: "confirmed" | "inferred" | "unverifiable";
  text: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line py-2">
      <div className="flex flex-col">
        <span>{label}</span>
        <span className="text-detail text-fg-muted">{evidence}</span>
      </div>
      <span className="th-req" data-state={state}>
        {text}
      </span>
    </div>
  );
}

export function HeroPreview({ showCvCard = true }: { showCvCard?: boolean }) {
  return (
    <div className={`relative text-fg ${showCvCard ? "pb-0 lg:pb-20" : ""}`}>
      <span className="th-tag absolute -top-3 right-3 z-10">
        Illustration with sample data
      </span>
      <div className="th-panel shadow-[0_24px_60px_color-mix(in_srgb,#000_30%,transparent)]">
        <div className="th-panel__head">
          <h3 className="text-control font-medium">Match</h3>
          <span className="th-match" data-tier="strong">
            Strong
          </span>
        </div>
        <div className="th-panel__body">
          <div>
            <div className="text-job font-medium">Frontend Developer</div>
            <div className="text-detail text-fg-muted">
              [Employer] · Cape Town · Hybrid
            </div>
          </div>
          <div className="text-3xl font-medium leading-9">80%</div>
          <div className="h-2 overflow-hidden rounded-tag bg-tag">
            <div className="h-full w-[80%] bg-success" />
          </div>
          <Req
            label="React experience"
            evidence="Evidence: Employment"
            state="confirmed"
            text="Confirmed"
          />
          <Req
            label="Azure experience"
            evidence="Related: certification"
            state="inferred"
            text="Inferred"
          />
          <Req
            label="Salary range"
            evidence="Not stated in the listing"
            state="unverifiable"
            text="Can't verify"
          />
        </div>
      </div>
      {showCvCard ? (
        <div className="th-panel mt-4 shadow-[0_24px_60px_color-mix(in_srgb,#000_30%,transparent)] lg:absolute lg:-right-3 lg:bottom-0 lg:mt-0 lg:w-[80%]">
          <div className="th-panel__head">
            <h3 className="text-control font-medium">Proposed CV change</h3>
            <span className="th-tag" data-tone="accent">
              Your decision
            </span>
          </div>
          <div className="th-panel__body">
            <div className="th-before">[Original bullet]</div>
            <div>[Reordered to lead with relevant work]</div>
            <div className="flex gap-2">
              <span className="th-btn th-btn-primary th-btn-sm">Accept</span>
              <span className="th-btn th-btn-secondary th-btn-sm">Reject</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DiscoveryPreview() {
  const row = (
    title: string,
    sub: string,
    tier: string,
    label: string,
    applied = false,
  ) => (
    <div className="flex items-start justify-between gap-3 border-t border-line px-4 py-3 first:border-t-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-job font-medium">{title}</span>
        {applied ? (
          <span className="th-tag self-start" data-tone="success">
            Applied · View application
          </span>
        ) : (
          <span className="text-detail text-fg-muted">{sub}</span>
        )}
      </div>
      <span className="th-match" data-tier={tier}>
        {label}
      </span>
    </div>
  );
  return (
    <div className="th-panel text-fg shadow-[0_24px_60px_color-mix(in_srgb,#000_28%,transparent)]">
      <div className="th-panel__head">
        <h3 className="text-control font-medium">Job Discovery</h3>
        <span className="text-detail text-fg-muted">New</span>
      </div>
      {row(
        "Frontend Developer",
        "[Employer] · Cape Town",
        "strong",
        "80% Strong",
      )}
      {row(
        "Full-Stack Developer (.NET)",
        "[Employer] · Remote",
        "fair",
        "64% Fair",
      )}
      {row("React Engineer", "", "lower", "41%", true)}
    </div>
  );
}

export function StudioPreview() {
  const opt = (label: string, on = false) => (
    <div
      className={`flex items-center justify-between rounded-control border px-3 py-2.5 ${
        on ? "border-accent-text bg-selected" : "border-line"
      }`}
    >
      <span>{label}</span>
      {on ? (
        <span className="th-tag" data-tone="accent">
          Recommended
        </span>
      ) : null}
    </div>
  );
  return (
    <div className="th-panel text-fg shadow-[0_24px_60px_color-mix(in_srgb,#000_28%,transparent)]">
      <div className="th-panel__head">
        <h3 className="text-control font-medium">Recommendation</h3>
        <span className="text-detail text-fg-muted">For this job</span>
      </div>
      <div className="th-panel__body">
        {opt("Create a tailored version", true)}
        {opt("Use \u201CFrontend v2\u201D")}
        {opt("Use your main CV")}
        <div className="th-before">[Original bullet]</div>
        <div>[Reordered to lead with relevant work]</div>
      </div>
    </div>
  );
}

export function TrackingPreview() {
  const cell = (label: string, value: string) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-detail text-fg-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
  return (
    <div className="th-panel text-fg shadow-[0_24px_60px_color-mix(in_srgb,#000_28%,transparent)]">
      <div className="th-panel__head">
        <h3 className="text-control font-medium">Quick recall</h3>
        <span className="th-status" data-status="contact">
          Recruiter contact
        </span>
      </div>
      <div className="th-panel__body">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {cell("Where it came from", "Job link")}
          {cell("What you submitted", "Tailored CV · Frontend v2")}
          {cell("What has happened", "Recruiter emailed you")}
          {cell("What\u2019s next", "Reply by [date]")}
        </div>
      </div>
    </div>
  );
}
