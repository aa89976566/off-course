/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Local JPEG assets are served from /public; skip the optimizer so covers
    // always render (sharp decode via /_next/image was returning null here).
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/murals", destination: "/work", permanent: false },
      { source: "/murals/:path*", destination: "/work", permanent: false },
      { source: "/digital", destination: "/work", permanent: false },
      { source: "/digital/:path*", destination: "/work", permanent: false },
    ];
  },
};

export default nextConfig;
