"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { IconButton } from "@mui/material";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { HomeAuthActions } from "@/thungatha-features/authentication/ui/home-auth-actions";
import { MobileWorkspaceMenu, MobileWorkspaceBottomNav } from "@/components/layout/mobile-workspace-menu";
export function MobileAppShell({ configured }: { configured: boolean }) {
 const [open,setOpen]=useState(false);
 const active=(href:string)=>typeof window!=="undefined"&&(window.location.pathname+window.location.search===href||(href==="/"&&window.location.pathname==="/"));
 return <>
  <header className="th-mobile-app-header"><Link href="/" aria-label="Thungatha home"><Image src="/brand/thungatha-logo.svg" alt="THUNGATHA" width={142} height={34} priority/></Link>
   <div className="th-mobile-app-actions"><ThemeToggle/><HomeAuthActions configured={configured} variant="nav"/><IconButton aria-label={open?"Close menu":"Open menu"} aria-expanded={open} onClick={()=>setOpen(v=>!v)} size="small">{open?<X size={20}/>:<Menu size={20}/>}</IconButton></div>
  </header>
  {open&&<MobileWorkspaceMenu open={open} configured={configured} isActive={active} onClose={()=>setOpen(false)}/>}
  <MobileWorkspaceBottomNav configured={configured} publicMode isActive={active}/>
 </>;
}
