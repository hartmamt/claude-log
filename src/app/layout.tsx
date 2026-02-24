import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "/insights - Building in Public with Claude Code",
  description:
    "Real insights from using an AI coding assistant as a full-stack engineering partner",
  metadataBase: new URL("https://slashinsights.codes"),
  openGraph: {
    title: "/insights",
    description:
      "Real insights from using an AI coding assistant as a full-stack engineering partner",
    url: "https://slashinsights.codes",
    siteName: "/insights",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "/insights - Building in Public with Claude Code",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "/insights",
    description:
      "Real insights from using an AI coding assistant as a full-stack engineering partner",
    images: ["/og.png"],
    creator: "@matthew_hartman",
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
      </body>
    </html>
  );
}
