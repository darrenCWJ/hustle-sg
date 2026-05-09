import "@/styles/global.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HustleSG — Verified gig work, Singapore",
  description:
    "Singapore's verified gig platform. Singpass identity, WSQ credential checks, AI-powered matching, and a path to registering your own company.",
  metadataBase: new URL((process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/^﻿/, "")),
  openGraph: {
    title: "HustleSG",
    description:
      "Verified freelancers. Singpass identity, WSQ-checked credentials, AI-powered matching.",
    type: "website",
  },
  manifest: "/manifest.json",
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1a1a1a" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
      </body>
    </html>
  );
}
