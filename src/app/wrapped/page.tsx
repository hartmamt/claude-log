import type { Metadata } from "next";
import { WrappedApp } from "@/components/wrapped/WrappedApp";

export const metadata: Metadata = {
  title: "Claude Code Wrapped - /insights",
  description:
    "Your AI coding year, wrapped. Upload your Claude Code /insights data and get a beautiful, shareable summary of your journey.",
  openGraph: {
    title: "Claude Code Wrapped",
    description:
      "Your AI coding year, wrapped. See your stats, share your journey.",
    type: "website",
  },
};

export default function WrappedPage() {
  return <WrappedApp />;
}
