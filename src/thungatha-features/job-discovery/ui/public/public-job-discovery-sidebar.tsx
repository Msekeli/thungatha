"use client";

import { ChartNoAxesColumn, ClipboardList, ShieldCheck } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function PublicJobDiscoverySidebar({ configured }: { configured: boolean }) {
  return (
    <aside className="th-discovery-sidebar th-feature-sidebar" aria-label="Thungatha features">
      <div className="th-feature-sidebar-heading">
        <strong>Make more of your job search</strong>
        <p>Find opportunities and use Thungatha tools to move forward with confidence.</p>
      </div>
      <article>
        <span className="th-feature-icon purple"><ClipboardList size={20} /></span>
        <div>
          <strong>CV matching</strong>
          <p>Build your profile so we can match opportunities to your skills and experience.</p>
          <small>Personalised recommendations</small>
          {configured && (
            <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
              <Button variant="secondary" size="sm" className="th-feature-signin">Create your profile</Button>
            </SignInButton>
          )}
        </div>
      </article>
      <article>
        <span className="th-feature-icon green"><ChartNoAxesColumn size={20} /></span>
        <div>
          <strong>Track Applications</strong>
          <p>Keep application status, follow-ups and next steps organised in one place.</p>
          <small>Stay on top of progress</small>
          {configured && (
            <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
              <Button variant="secondary" size="sm" className="th-feature-signin">Sign in to track</Button>
            </SignInButton>
          )}
        </div>
      </article>
      <article>
        <span className="th-feature-icon orange"><ShieldCheck size={20} /></span>
        <div>
          <strong>Saved Jobs</strong>
          <p>Bookmark relevant roles and return to them when you are ready to apply.</p>
          <small>Build your shortlist</small>
          {configured && (
            <SignInButton mode="modal" fallbackRedirectUrl="/jobs?welcome=1">
              <Button variant="secondary" size="sm" className="th-feature-signin">Sign in to save jobs</Button>
            </SignInButton>
          )}
        </div>
      </article>
    </aside>
  );
}
