"use client";

import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { FileUser, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { configured: boolean; variant: "inline" | "wide"; onDismiss: () => void };

function PromoActions({ configured, wide }: { configured: boolean; wide: boolean }) {
  return <div className={wide ? "th-wide-promo-actions" : "th-promo-actions"}>
    {configured ? <><SignUpButton mode="modal"><Button variant="primary" size="sm">Create free account</Button></SignUpButton><SignInButton mode="modal"><Button variant="secondary" size="sm">Sign in</Button></SignInButton></> : <><Link href="/sign-up">Create free account</Link><Link href="/sign-in">Sign in</Link></>}
  </div>;
}

export function PublicJobPromo({ configured, variant, onDismiss }: Props) {
  const wide = variant === "wide";
  return <aside className={wide ? "th-wide-promo" : "th-inline-promo"}>
    <span className="th-promo-art"><FileUser size={wide ? 28 : 25} /></span>
    {wide ? <>
      <div><small>GET MORE FROM THUNGATHA</small><h2>Take control of your job search journey</h2><p>Create a free account to tailor your CV, save jobs, track applications and access AI-powered tools.</p></div>
      <PromoActions configured={configured} wide />
    </> : <div><strong>Get more from Thungatha</strong><p>Tailor your CV, track your applications and use AI tools to stand out.</p><PromoActions configured={configured} wide={false} /></div>}
    <Button variant="ghost" size="sm" type="button" aria-label="Dismiss promotion" onClick={onDismiss}><X size={16} /></Button>
  </aside>;
}
