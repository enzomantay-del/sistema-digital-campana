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

/** Dónde se muestra el hueco vacío (define ancho y altura percibida). */
export type DestinoHuecoPublicidad = "columna" | "franja" | "principal";

export function claseAnchoVariante(
  variante: VariantePublicidad,
  anchoFila = false,
  destino: DestinoHuecoPublicidad = "columna",
): string {
  if (destino === "principal") {
    return "mx-auto w-full max-w-page";
  }
  if (destino === "franja" || anchoFila) {
    if (variante === "leaderboard" || variante === "banner") {
      return "w-full max-w-page";
    }
    return "w-full max-w-page";
  }
  if (destino === "columna") {
    return "w-full min-w-0";
  }
  switch (variante) {
    case "leaderboard":
      return "mx-auto w-full max-w-[970px]";
    case "banner":
      return "mx-auto w-full max-w-page";
    case "mpu":
    case "cuadrado":
      return "mx-auto w-full max-w-[min(100%,340px)] sm:max-w-[300px]";
    case "skyscraper":
    case "vertical-alto":
      return "mx-auto w-full max-w-[300px]";
    default:
      return "w-full";
  }
}

/** Marco del hueco vacío: priorizamos superficie visible para vender creatividades grandes. */
export function claseMarcoHueco(
  formato: Exclude<VariantePublicidad, "contenido">,
  opts: { destino: DestinoHuecoPublicidad; rellenoVertical?: boolean },
): string {
  const { destino, rellenoVertical } = opts;
  if (rellenoVertical || destino === "columna") {
    return "h-full w-full min-h-[min(44vh,560px)]";
  }
  if (destino === "franja") {
    if (formato === "leaderboard") return "aspect-[970/250] w-full min-h-[clamp(140px,22vw,280px)]";
    return "aspect-[728/90] w-full min-h-[clamp(100px,14vw,120px)]";
  }
  switch (formato) {
    case "leaderboard":
      return "aspect-[970/250] w-full min-h-[clamp(180px,28vw,300px)]";
    case "banner":
      return "aspect-[728/90] w-full min-h-[clamp(120px,16vw,140px)]";
    case "mpu":
    case "cuadrado":
      return "w-full min-h-[clamp(260px,52vw,420px)] sm:min-h-[340px]";
    case "skyscraper":
    case "vertical-alto":
      return "mx-auto w-full max-w-[360px] min-h-[clamp(380px,72vw,560px)]";
    default:
      return "min-h-[280px] w-full";
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