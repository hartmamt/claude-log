import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "insights.codes - Notes on building with AI",
  description:
    "Notes on building with AI — real patterns from real projects",
  metadataBase: new URL("https://insights.codes"),
  openGraph: {
    title: "insights.codes",
    description:
      "Notes on building with AI — real patterns from real projects",
    url: "https://insights.codes",
    siteName: "insights.codes",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "insights.codes - Notes on building with AI",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "insights.codes",
    description:
      "Notes on building with AI — real patterns from real projects",
    images: ["/og.png"],
    creator: "@matthew_hartman",
  },
  alternates: {
    types: {
      "application/rss+xml": [
        {
          url: "https://insights.codes/feed.xml",
          title: "insights.codes RSS Feed",
        },
      ],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
