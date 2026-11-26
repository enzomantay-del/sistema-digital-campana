import { PublicidadVideo } from "@/components/PublicidadVideo";
import { TarjetaPublicidad } from "@/components/TarjetaPublicidad";
import { claseAspectoVariante, type VariantePublicidad } from "@/lib/formatosPublicidad";
import { videoPatrocinio } from "@/lib/patrocinios";

type FormatoVideo = Exclude<VariantePublicidad, "contenido">;

/** Aviso con video en el formato IAB correspondiente. */
export function PublicidadCreatividad({
  formato,
  anchoFila = false,
  etiquetaAccesible = "Publicidad en video",
}: {
  formato: FormatoVideo;
  anchoFila?: boolean;
  etiquetaAccesible?: string;
}) {
  const src = videoPatrocinio(formato);
  if (!src) return null;
  const aspecto = claseAspectoVariante(formato);
  const fila = anchoFila || formato === "banner" || formato === "leaderboard";
  const columna =
    formato === "skyscraper" || formato === "vertical-alto" || formato === "mpu" || formato === "cuadrado";
  const tamanoNatural = fila || columna;

  return (
    <TarjetaPublicidad variante={formato} compacto anchoFila={fila} ejemplo creatividadVideo>
      {tamanoNatural ? (
        <PublicidadVideo src={src} etiquetaAccesible={etiquetaAccesible} alturaNatural />
      ) : (
        <div
          className={`publicidad-video-marco relative w-full overflow-hidden bg-[#0f1f33] leading-[0] ${aspecto ?? "w-full"}`}
        >
          <PublicidadVideo src={src} etiquetaAccesible={etiquetaAccesible} />
        </div>
      )}
    </TarjetaPublicidad>
  );
}