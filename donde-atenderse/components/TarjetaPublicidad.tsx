import type { ReactNode } from "react";
import { claseAnchoVariante, type VariantePublicidad } from "@/lib/formatosPublicidad";

/** Presentación de avisos al estilo portal de noticias (etiqueta discreta, marco fino). */
export function TarjetaPublicidad({
  children,
  variante = "contenido",
  ejemplo = false,
  compacto = false,
  anchoFila = false,
}: {
  children: ReactNode;
  variante?: VariantePublicidad;
  ejemplo?: boolean;
  /** Menos aire entre rótulo y creatividad (listados y columnas). */
  compacto?: boolean;
  /** Banner / leaderboard ocupan todo el ancho del contenedor (sin bandas vacías a los lados). */
  anchoFila?: boolean;
}) {
  const rotulo = ejemplo ? "Publicidad · ejemplo" : "Publicidad";
  const ancho = claseAnchoVariante(variante, anchoFila);
  const gap = compacto ? "gap-0.5" : "gap-1";
  const rotuloClass = compacto
    ? "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted"
    : "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted";

  return (
    <div
      className={`grid ${gap} ${ancho}`}
      data-publicidad-variante={variante}
      data-publicidad-ejemplo={ejemplo ? "1" : undefined}
    >
      <p className={rotuloClass}>{rotulo}</p>
      <div className="overflow-hidden rounded-md border border-line/80 bg-[#f8fafc] p-0">{children}</div>
    </div>
  );
}