import "@/styles/global.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HustleSG — Verified gig work, Singapore",
  description:
    "Singapore's verified gig platform. Singpass identity, WSQ credential checks, AI-powered matching, and a path to registering your own company.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "HustleSG",
    description:
      "Verified freelancers. Singpass identity, WSQ-checked credentials, AI-powered matching.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
