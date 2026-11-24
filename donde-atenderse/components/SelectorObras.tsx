"use client";

import { incluye } from "@/lib/format";
import { useMemo, useState } from "react";

type Props = {
  catalogo: string[];
  seleccionadas: string[];
  otraObra: string;
  onSeleccionadas: (obras: string[]) => void;
  onOtraObra: (valor: string) => void;
  titulo?: string;
  avisoCampo?: string | null;
};

/** Catálogo de obras en panel acotado, con búsqueda y pastillas chicas. */
export function SelectorObras({
  catalogo,
  seleccionadas,
  otraObra,
  onSeleccionadas,
  onOtraObra,
  titulo = "Obra social",
  avisoCampo,
}: Props) {
  const [filtro, setFiltro] = useState("");
  const [listadoAbierto, setListadoAbierto] = useState(seleccionadas.length === 0);

  const visibles = useMemo(
    () => catalogo.filter((obra) => incluye(obra, filtro)),
    [catalogo, filtro],
  );

  function alternar(obra: string, activa: boolean) {
    onSeleccionadas(activa ? [...seleccionadas, obra] : seleccionadas.filter((item) => item !== obra));
  }

  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-semibold">{titulo}</legend>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="pastilla pastilla-compacta text-link"
          onClick={() => {
            onSeleccionadas(["Particular"]);
            onOtraObra("");
          }}
        >
          Solo particular
        </button>
        <span className="text-xs text-muted">
          {seleccionadas.length ? `${seleccionadas.length} marcada(s)` : "Ninguna marcada"}
        </span>
      </div>
      {seleccionadas.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {seleccionadas.map((obra) => (
            <button
              key={obra}
              type="button"
              title="Quitar"
              className="pastilla pastilla-compacta pastilla-activa"
              onClick={() => alternar(obra, false)}
            >
              {obra} ×
            </button>
          ))}
        </div>
      ) : null}
      <details
        className="rounded-xl border border-line bg-[#f8fafc] px-3 py-2"
        open={listadoAbierto}
        onToggle={(event) => setListadoAbierto((event.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer text-xs font-semibold text-ink">Listado completo</summary>
        <label className="mt-2 grid gap-1 text-xs text-muted">
          Buscar
          <input
            className="campo py-1.5 text-xs"
            placeholder="Ej. OSDE, PAMI…"
            value={filtro}
            onChange={(event) => setFiltro(event.target.value)}
          />
        </label>
        <div className="mt-2 max-h-32 overflow-y-auto">
          <div className="flex flex-wrap gap-1.5">
            {visibles.map((obra) => {
              const activa = seleccionadas.includes(obra);
              return (
                <label
                  key={obra}
                  className={activa ? "pastilla pastilla-compacta pastilla-activa" : "pastilla pastilla-compacta"}
                >
                  <input
                    className="sr-only"
                    type="checkbox"
                    checked={activa}
                    onChange={(event) => alternar(obra, event.target.checked)}
                  />
                  {obra}
                </label>
              );
            })}
            {visibles.length === 0 ? <p className="text-xs text-muted">No hay coincidencias.</p> : null}
          </div>
        </div>
      </details>
      <input
        className="campo py-2 text-sm"
        placeholder="Otra obra (texto libre)"
        value={otraObra}
        onChange={(event) => onOtraObra(event.target.value)}
      />
      {avisoCampo ? (
        <p className="text-sm font-semibold leading-snug text-warn" role="alert">
          {avisoCampo}
        </p>
      ) : null}
    </fieldset>
  );
}