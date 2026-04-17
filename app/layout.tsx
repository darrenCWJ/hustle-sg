import "@/styles/global.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hustle SG — Verified side hustle, Singapore-made",
  description:
    "A Singapore-first gig platform with Singpass identity, WSQ & university cert verification, portfolio videos, async video interviews, and a path to registering your own company.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Hustle SG",
    description:
      "Verified side hustlers. Singpass ID, WSQ-checked certs, real portfolio videos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-SG">
      <body>{children}</body>
    </html>
  );
}
