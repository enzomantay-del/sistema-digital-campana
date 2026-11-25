/** Formatos de espacio comercial (IAB orientativo). */
export type VariantePublicidad =
  | "leaderboard"
  | "banner"
  | "mpu"
  | "cuadrado"
  | "skyscraper"
  | "vertical-alto"
  | "contenido";

export type MedidaPublicidad = { ancho: number; alto: number; nombre: string };

export const MEDIDA_PUBLICIDAD: Record<Exclude<VariantePublicidad, "contenido">, MedidaPublicidad> = {
  leaderboard: { ancho: 970, alto: 250, nombre: "Leaderboard" },
  banner: { ancho: 728, alto: 90, nombre: "Banner" },
  mpu: { ancho: 300, alto: 250, nombre: "Rectángulo medio" },
  cuadrado: { ancho: 300, alto: 300, nombre: "Cuadrado" },
  skyscraper: { ancho: 300, alto: 600, nombre: "Skyscraper" },
  "vertical-alto": { ancho: 300, alto: 400, nombre: "Vertical" },
};

export function claseAnchoVariante(variante: VariantePublicidad, anchoFila = false): string {
  if (anchoFila && (variante === "leaderboard" || variante === "banner")) {
    return "w-full max-w-full";
  }
  switch (variante) {
    case "leaderboard":
      return "mx-auto w-full max-w-[970px]";
    case "banner":
      return "mx-auto w-full max-w-page";
    case "mpu":
    case "cuadrado":
    case "skyscraper":
    case "vertical-alto":
      return "mx-auto w-full max-w-[300px]";
    default:
      return "w-full";
  }
}

export function claseAspectoVariante(variante: VariantePublicidad): string | undefined {
  switch (variante) {
    case "leaderboard":
      return "aspect-[970/250] w-full";
    case "banner":
      return "aspect-[728/90] w-full";
    case "mpu":
      return "aspect-[6/5] w-full";
    case "cuadrado":
      return "aspect-square w-full";
    case "skyscraper":
      return "aspect-[1/2] w-full";
    case "vertical-alto":
      return "aspect-[3/4] w-full";
    default:
      return undefined;
  }
}

/** Orden para rotar formatos entre resultados de búsqueda. */
export const ROTACION_LISTADO: VariantePublicidad[] = ["mpu", "cuadrado", "vertical-alto"];