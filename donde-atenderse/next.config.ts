import type { NextConfig } from "next";

/**
 * Desarrollo (`next dev`) usa `.next`.
 * Producción (`npm run build`) usa `.next-prod` para no pisar el dev ni romper el túnel.
 */
const esBuildProduccion = process.env.NEXT_BUILD_DIR === "prod";

const nextConfig: NextConfig = {
  distDir: esBuildProduccion ? ".next-prod" : ".next",
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
