import type { MetadataRoute } from "next";
import { urlSitioPublico } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const base = urlSitioPublico();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}