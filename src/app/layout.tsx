import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AtmoQuest — Goal Setting & Tracking Portal",
  description:
    "Enterprise-grade goal setting, tracking, and performance management platform. Align teams, track quarterly progress, and drive organizational excellence.",
  keywords: "goal setting, performance tracking, OKR, KPI, quarterly check-in",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
