import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsletterGate } from "@/components/NewsletterGate";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mars-rust.vercel.app"),
  title: { default: "MARS — Africa's food economy, decoded", template: "%s · MARS" },
  description: "Agriculture, commodities, climate, logistics, trade and market intelligence for Africa.",
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
  openGraph: {
    title: "MARS",
    description: "Africa's food economy, decoded.",
    type: "website"
  },
  twitter: { card:"summary_large_image", title:"MARS", description:"Africa's food economy, decoded." }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header />{children}<Footer /><NewsletterGate /></body></html>;
}
