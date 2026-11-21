import type { NextConfig } from "next";

/**
 * Desarrollo (`next dev`) y deploy (`npm run build`) usan `.next`.
 * Solo `npm run preview` compila en `.next-prod` para no pisar el dev local.
 */
const esBuildProduccion = process.env.NEXT_BUILD_DIR === "prod";

const nextConfig: NextConfig = {
  distDir: esBuildProduccion ? ".next-prod" : ".next",
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
