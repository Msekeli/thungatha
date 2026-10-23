import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Geist } from "next/font/google";
import { AuthProviders } from "@/thungatha-features/authentication/ui/auth-providers";
import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { themeInitScript } from "@/lib/theme";
import { AppThemeProvider } from "@/components/theme/app-theme-provider";
import { MobileAppShell } from "@/components/layout/mobile-app-shell";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// Inter powers the design system through the --font-inter variable.
// Weight 800 is used only by the THUNGATHA wordmark.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thungatha",
  description: "AI-assisted job search and application management",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AppThemeProvider>
          <AuthProviders configured={hasClerkConfiguration()}>
            <MobileAppShell configured={hasClerkConfiguration()} />
            {children}
          </AuthProviders>
        </AppThemeProvider>
      </body>
    </html>
  );
}
