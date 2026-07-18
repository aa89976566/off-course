/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/contact", destination: "/start", permanent: false },
      { source: "/work", destination: "/get-lost", permanent: false },
      { source: "/work/:path*", destination: "/get-lost", permanent: false },
      { source: "/playground", destination: "/get-found", permanent: false },
      {
        source: "/playground/:path*",
        destination: "/get-found",
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
