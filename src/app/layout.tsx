import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "ESGwise — AI-Powered ESG Assessment Platform",
  description: "Simplify sustainability reporting with GRI-aligned assessments, AI-driven insights, and investor-grade reports for startups and SMEs.",
  keywords: "ESG, sustainability, GRI, reporting, assessment, SME, startup, environmental, social, governance",
  manifest: "/manifest.json",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
