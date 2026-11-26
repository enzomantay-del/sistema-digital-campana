"use client";

import { useId, useState } from "react";

const MAX_VISIBLES = 5;

/** Obras sociales en una línea chica; expande si hay muchas. */
export function ListaObrasCompacta({
  obras,
  etiqueta = "Obras sociales",
  maxVisibles = MAX_VISIBLES,
}: {
  obras: string[];
  etiqueta?: string;
  maxVisibles?: number;
}) {
  const [expandido, setExpandido] = useState(false);
  const panelId = useId();

  if (obras.length === 0) return null;

  const recortar = obras.length > maxVisibles && !expandido;
  const visibles = recortar ? obras.slice(0, maxVisibles) : obras;
  const resto = obras.length - maxVisibles;

  return (
    <div className="text-[0.7rem] leading-snug text-ink">
      <span className="text-muted">{etiqueta}: </span>
      {visibles.join(" · ")}
      {recortar && resto > 0 ? (
        <>
          {" "}
          <button
            type="button"
            className="font-semibold text-link underline-offset-2 hover:underline"
            aria-expanded={expandido}
            aria-controls={panelId}
            onClick={() => setExpandido(true)}
          >
            y {resto} más
          </button>
        </>
      ) : null}
      {expandido && obras.length > maxVisibles ? (
        <button
          type="button"
          className="ml-1 font-semibold text-link underline-offset-2 hover:underline"
          onClick={() => setExpandido(false)}
        >
          Ver menos
        </button>
      ) : null}
    </div>
  );
}