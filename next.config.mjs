/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Disables the Next.js 15.3+ segment-explorer devtools overlay, which causes
  // a "SegmentViewNode not in React Client Manifest" error in the dev server.
  devIndicators: false,
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
