import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AuthProviders } from "@/thungatha-features/authentication/ui/auth-providers";
import { hasClerkConfiguration } from "@/thungatha-features/authentication/server/identity";
import { themeInitScript } from "@/lib/theme";
import { AppThemeProvider } from "@/components/theme/app-theme-provider";
import { MobileAppShell } from "@/components/layout/mobile-app-shell";
import "./globals.css";

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
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AppThemeProvider>
          <AuthProviders configured={hasClerkConfiguration()}>
            {children}
            <MobileAppShell configured={hasClerkConfiguration()} />
          </AuthProviders>
        </AppThemeProvider>
      </body>
    </html>
  );
}
