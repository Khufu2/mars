import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  title: { default: "MARS — Africa's food economy, decoded", template: "%s · MARS" },
  description: "Agriculture, commodities, climate, logistics, trade and market intelligence for Africa.",
  openGraph: {
    title: "MARS",
    description: "Africa's food economy, decoded.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
