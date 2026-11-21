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
};

export default nextConfig;
