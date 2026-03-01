import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlackRock Risk Dashboard | Portfolio Analytics & AI Commentary",
  description:
    "Institutional-grade portfolio risk analytics with GenAI commentary, Monte Carlo simulation, and interactive visualizations.",
  authors: [{ name: "Nhat Nguyen", url: "mailto:Nhatmn114@gmail.com" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
