/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig = {
  ...(staticExport ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // Allow Cloudflare quick-tunnel previews to load /_next assets in dev
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.loca.lt",
    "127.0.0.1",
    "localhost",
  ],
  // redirects are unsupported with `output: 'export'`
  ...(!staticExport
    ? {
        async redirects() {
          return [
            { source: "/projects", destination: "/archive", permanent: false },
            { source: "/projects/:path*", destination: "/archive", permanent: false },
            { source: "/start", destination: "/contact", permanent: false },
            { source: "/logbook", destination: "/archive", permanent: false },
            { source: "/work", destination: "/archive", permanent: false },
            {
              source: "/work/:path*",
              destination: "/archive",
              permanent: false,
            },
            {
              source: "/playground",
              destination: "/archive",
              permanent: false,
            },
            {
              source: "/playground/:path*",
              destination: "/archive",
              permanent: false,
            },
            { source: "/murals", destination: "/get-lost", permanent: false },
            {
              source: "/murals/:path*",
              destination: "/get-lost",
              permanent: false,
            },
            { source: "/digital", destination: "/get-found", permanent: false },
            {
              source: "/digital/:path*",
              destination: "/get-found",
              permanent: false,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
