import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsletterGate } from "@/components/NewsletterGate";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mars-rust.vercel.app"),
  title: { default: "MARS — Africa, Markets & the World", template: "%s · MARS" },
  description: "Independent African business journalism and source-linked intelligence across markets, companies, agriculture, technology, trade, climate and the world.",
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
  openGraph: {
    title: "MARS",
    description: "Africa, markets and the forces reshaping the world.",
    type: "website"
  },
  twitter: { card:"summary_large_image", title:"MARS", description:"Africa's food economy, decoded." }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header />{children}<Footer /><NewsletterGate /></body></html>;
}
