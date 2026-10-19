import Link from "next/link";
import { Search, PanelsTopLeft, ClipboardCheck, Bookmark, BriefcaseBusiness, UserRound, Settings } from "lucide-react";

type Destination = { href: string; label: string; icon: typeof Search };
const workspace: Destination[] = [
  { href: "/jobs", label: "Job Discovery", icon: Search },
  { href: "/cv-studio", label: "CV Studio", icon: PanelsTopLeft },
  { href: "/applications", label: "Job Tracking", icon: ClipboardCheck },
  { href: "/jobs?status=saved", label: "Saved Jobs", icon: Bookmark },
  {
    href: "/jobs?status=dismissed",
    label: "Dismissed",
    icon: BriefcaseBusiness,
  },
];
const personal: Destination[] = [
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/account", label: "Settings", icon: Settings },
];

export function WorkspaceSidebarNav({ active }: { active: string }) {
  return (
    <nav className="th-workspace-nav" aria-label="Workspace">
              <p className="th-workspace-nav-label">Workspace</p>
              {workspace.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="th-workspace-nav-link"
                  data-active={active === item.href}
                  aria-current={active === item.href ? "page" : undefined}
                >
                  <item.icon
                    className="th-workspace-nav-icon"
                    aria-hidden="true"
                    size={17}
                    strokeWidth={1.7}
                  />
                  {item.label}
                </Link>
              ))}
              <p className="th-workspace-nav-label th-workspace-you-label">You</p>
              {personal.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="th-workspace-nav-link"
                  data-active={active === item.href}
                >
                  <item.icon
                    className="th-workspace-nav-icon"
                    aria-hidden="true"
                    size={17}
                    strokeWidth={1.7}
                  />
                  {item.label}
                </Link>
              ))}
            </nav>
  );
}
