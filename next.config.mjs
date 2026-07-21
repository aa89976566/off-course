/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Allow Cloudflare quick-tunnel previews to load /_next assets in dev
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.loca.lt",
    "127.0.0.1",
    "localhost",
  ],
  async redirects() {
    return [
      { source: "/contact", destination: "/start", permanent: false },
      { source: "/logbook", destination: "/projects", permanent: false },
      { source: "/work", destination: "/projects", permanent: false },
      { source: "/work/:path*", destination: "/projects", permanent: false },
      { source: "/playground", destination: "/projects", permanent: false },
      {
        source: "/playground/:path*",
        destination: "/projects",
        permanent: false,
      },
      { source: "/murals", destination: "/get-lost", permanent: false },
      { source: "/murals/:path*", destination: "/get-lost", permanent: false },
      { source: "/digital", destination: "/get-found", permanent: false },
      {
        source: "/digital/:path*",
        destination: "/get-found",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
