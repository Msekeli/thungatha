import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AuthProviders } from "@/components/auth/auth-providers";
import { hasClerkConfiguration } from "@/lib/auth/identity";
import { themeInitScript } from "@/lib/theme";
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
        <AuthProviders configured={hasClerkConfiguration()}>
          {children}
        </AuthProviders>
      </body>
    </html>
  );
}
