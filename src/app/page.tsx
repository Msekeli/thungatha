import { HomeAuthActions } from "@/components/auth/home-auth-actions";
import { BrandMark } from "@/components/brand-mark";
import {
  DiscoveryPreview,
  HeroPreview,
  StudioPreview,
  TrackingPreview,
} from "@/components/landing/previews";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { hasClerkConfiguration } from "@/lib/auth/identity";

const modules = [
  {
    id: "discovery",
    number: "01",
    name: "Job Discovery",
    title: "Roles worth your attention",
    body: "Search and filter listings from approved job sources, and see how well each one fits your confirmed profile, with the evidence shown.",
    points: [
      "Save or dismiss jobs without creating an application",
      "See the match as a percentage, with each requirement explained",
      "Jobs you have applied for are marked, so you never lose track",
    ],
    Preview: DiscoveryPreview,
  },
  {
    id: "studio",
    number: "02",
    name: "CV Studio",
    title: "A CV that fits each job, honestly",
    body: "Start from your main CV, or upload one. Paste a job link or description, or pick a job from Job Discovery, and review every suggested change.",
    points: [
      "Works on its own, with no profile required",
      "Nothing is invented, and your main CV is never overwritten",
      "Compare versions, save the ones you like, and export",
    ],
    Preview: StudioPreview,
  },
  {
    id: "tracking",
    number: "03",
    name: "Job Tracking",
    title: "Every application, in context",
    body: "Record the jobs you apply for, wherever you found them, and keep the full story of each one.",
    points: [
      "Keeps the CV version you submitted, with status history",
      "Interviews, communications, follow-ups and deadlines in one place",
      "See the context at a glance when a recruiter gets in touch",
    ],
    Preview: TrackingPreview,
  },
];

const supporting = [
  {
    name: "Profile",
    body: "Your confirmed professional details. Imported information is reviewed by you before it is trusted.",
  },
  {
    name: "Matching",
    body: "Fit assessments that explain themselves and separate confirmed facts from guesses.",
  },
  {
    name: "Account",
    body: "Your preferences, sign-in methods and data controls, in one place.",
  },
];

const principles = [
  {
    name: "Evidence over assertion",
    body: "Matches and CV changes point to the profile evidence behind them.",
  },
  {
    name: "Unknown means unknown",
    body: "Missing information is never quietly treated as good or bad.",
  },
  {
    name: "History is preserved",
    body: "Jobs that disappear are marked unavailable, and applications keep the CV you used.",
  },
];

function Check() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-[3px] shrink-0 text-accent-text"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

const container = "mx-auto w-full max-w-[1200px] px-6 md:px-10";

export default function Home() {
  const configured = hasClerkConfiguration();

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-page text-fg">
      <div
        aria-hidden="true"
        className="th-hero-bg pointer-events-none absolute inset-x-0 top-0 h-[640px]"
      />

      <header className="relative">
        <div
          className={`${container} flex h-16 items-center justify-between gap-4 md:h-[72px]`}
        >
          <BrandMark />
          <nav
            aria-label="Product"
            className="hidden gap-8 text-control md:flex"
          >
            {modules.map((m) => {
              const routes: Record<string, string> = {
                discovery: "/jobs",
                studio: "/cv-studio",
                tracking: "/applications",
              };

              return (
                <a
                  key={m.id}
                  href={routes[m.id]}
                  className="rounded-tag py-2 font-medium text-fg underline decoration-success/50 decoration-2 underline-offset-[10px] transition-colors hover:text-accent-text hover:decoration-success focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-text"
                >
                  {m.name}
                </a>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <HomeAuthActions configured={configured} variant="nav" />
          </div>
        </div>
      </header>

      <main className="relative">
        <section
          className={`${container} grid items-center gap-12 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24 lg:pt-16`}
        >
          <div className="th-rise">
            <span className="th-tag" data-tone="accent">
              Job search, tailored and tracked
            </span>
            <h1 className="mt-4 text-[34px] font-medium leading-[1.1] tracking-tight md:text-5xl">
              Find it. Tailor it.{" "}
              <span className="text-accent-text">Track it.</span>
            </h1>
            <p className="mt-5 max-w-[520px] text-base leading-[26px] text-fg-muted">
              Thungatha helps you discover relevant roles, tailor your CV for
              each one without inventing a thing, and keep track of every
              application.
            </p>
            <div className="mt-7">
              <HomeAuthActions configured={configured} variant="hero" />
            </div>
            <p className="mt-4 text-detail text-fg-muted">
              Already have a CV? You can start with CV Studio on its own.
            </p>
          </div>
          <div className="th-rise th-rise-2">
            <HeroPreview />
          </div>
        </section>

        {modules.map((m, i) => (
          <section
            key={m.id}
            id={m.id}
            aria-labelledby={`${m.id}-title`}
            className={`${container} grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-16`}
          >
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <span className="th-tag" data-tone="accent">
                {m.number} · {m.name}
              </span>
              <h2
                id={`${m.id}-title`}
                className="mt-3.5 text-[24px] font-medium leading-[30px] md:text-3xl md:leading-9"
              >
                {m.title}
              </h2>
              <p className="mt-3 text-base leading-[26px] text-fg-muted">
                {m.body}
              </p>
              <ul className="mt-[18px] flex flex-col gap-2.5">
                {m.points.map((p) => (
                  <li
                    key={p}
                    className="flex gap-2.5 text-[14px] leading-[22px]"
                  >
                    <Check />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <m.Preview />
            </div>
          </section>
        ))}

        <section
          aria-labelledby="supporting-title"
          className={`${container} py-16`}
        >
          <div className="mx-auto mb-10 max-w-[620px] text-center">
            <h2
              id="supporting-title"
              className="text-[24px] font-medium leading-[30px] md:text-3xl md:leading-9"
            >
              Behind the three
            </h2>
            <p className="mt-2.5 text-[14px] leading-[22px] text-fg-muted">
              Supporting parts that keep everything accurate and in your
              control.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {supporting.map((s) => (
              <div
                key={s.name}
                className="th-lift flex flex-col gap-2 rounded-panel border border-line bg-panel p-5"
              >
                <h3 className="text-job font-medium">{s.name}</h3>
                <p className="text-control text-fg-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Principles" className={`${container} pb-16`}>
          <div className="th-panel grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
            {principles.map((p) => (
              <div key={p.name} className="flex flex-col gap-1.5 p-6">
                <h3 className="text-job font-medium">{p.name}</h3>
                <p className="text-control text-fg-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="cta-title" className={`${container} pb-20`}>
          <div className="th-cta rounded-panel border border-line px-6 py-14 text-center">
            <h2
              id="cta-title"
              className="text-[24px] font-medium leading-[30px] md:text-3xl md:leading-9"
            >
              Ready when you are
            </h2>
            <p className="mb-6 mt-2.5 text-[14px] text-fg-muted">
              Create an account and start with whichever part you need first.
            </p>
            <div className="flex justify-center">
              <HomeAuthActions configured={configured} variant="cta" />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative">
        <div
          className={`${container} flex flex-wrap items-center justify-between gap-4 pb-10 pt-4 text-detail text-fg-muted`}
        >
          <BrandMark />
          <span>© Thungatha</span>
        </div>
      </footer>
    </div>
  );
}
