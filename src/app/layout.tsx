import type { Metadata } from "next";
import { AuthProviders } from "@/components/auth/auth-providers";
import { hasClerkConfiguration } from "@/lib/auth/identity";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thungatha",
  description: "AI-assisted job search and application management",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProviders configured={hasClerkConfiguration()}>
          {children}
        </AuthProviders>
      </body>
    </html>
  );
}
