import type { MetadataRoute } from "next";
import { urlSitioPublico } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = urlSitioPublico();
  const ahora = new Date();
  const rutas = ["/", "/buscar", "/farmacia", "/contacto", "/privacidad", "/terminos", "/crear-cuenta", "/soy-profesional"];
  return rutas.map((ruta) => ({
    url: `${base}${ruta}`,
    lastModified: ahora,
    changeFrequency: ruta === "/" ? "weekly" : "monthly",
    priority: ruta === "/" ? 1 : 0.7,
  }));
}