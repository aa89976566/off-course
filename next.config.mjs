/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/murals", destination: "/work", permanent: false },
      { source: "/murals/:slug", destination: "/work/:slug", permanent: false },
      { source: "/digital", destination: "/work", permanent: false },
      {
        source: "/digital/:slug",
        destination: "/work/:slug",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
