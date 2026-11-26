import type { VariantePublicidad } from "@/lib/formatosPublicidad";

/** Creatividades de campaña (MP4 en /public/patrocinios). */
export const VIDEO_PATROCINIO: Partial<Record<Exclude<VariantePublicidad, "contenido">, string>> = {
  leaderboard: "/patrocinios/leaderboard-970x250.mp4",
  banner: "/patrocinios/banner-728x90.mp4",
  "vertical-alto": "/patrocinios/vertical-300x400.mp4",
  skyscraper: "/patrocinios/skyscraper-300x600.mp4",
};

export function videoPatrocinio(formato: Exclude<VariantePublicidad, "contenido">): string | undefined {
  return VIDEO_PATROCINIO[formato];
}