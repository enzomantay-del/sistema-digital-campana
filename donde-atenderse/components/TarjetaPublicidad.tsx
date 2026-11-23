import type { ReactNode } from "react";

/** Presentación de avisos al estilo portal de noticias (ej. banda horizontal + columna tipo 300×600). */
export function TarjetaPublicidad({
  children,
  variante = "contenido",
  ejemplo = false,
}: {
  children: ReactNode;
  /** leaderboard = banda bajo el buscador; skyscraper = columna lateral ~300px. */
  variante?: "leaderboard" | "skyscraper" | "contenido";
  /** Muestra “Publicidad · ejemplo” hasta tener anunciante real. */
  ejemplo?: boolean;
}) {
  const rotulo = ejemplo ? "Publicidad · ejemplo" : "Publicidad";
  const ancho =
    variante === "skyscraper" ? "w-full max-w-[300px] mx-auto lg:mx-0" : "w-full max-w-[970px] mx-auto";

  return (
    <div
      className={`grid gap-2 ${ancho}`}
      data-publicidad-variante={variante}
      data-publicidad-ejemplo={ejemplo ? "1" : undefined}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{rotulo}</p>
      <div className="overflow-hidden rounded-lg border border-line/90 bg-[#f8fafc]">{children}</div>
    </div>
  );
}