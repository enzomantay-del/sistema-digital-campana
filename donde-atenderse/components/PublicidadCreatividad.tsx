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

  return (
    <TarjetaPublicidad variante={formato} compacto anchoFila={fila}>
      <div className={`publicidad-video-marco relative overflow-hidden bg-[#0f1f33] ${aspecto ?? "w-full"}`}>
        <video
          className="video-publicidad h-full w-full object-cover"
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          aria-label={etiquetaAccesible}
        />
      </div>
    </TarjetaPublicidad>
  );
}