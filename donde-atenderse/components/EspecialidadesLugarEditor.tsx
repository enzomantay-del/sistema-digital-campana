"use client";

import { useState } from "react";
import { guardarEspecialidadesLugar } from "@/actions/lugarEspecialidades";
import { ESPECIALIDADES_CATALOGO } from "@/lib/especialidades";

export function EspecialidadesLugarEditor({
  placeId,
  iniciales,
}: {
  placeId: string;
  iniciales: string[];
}) {
  const [seleccion, setSeleccion] = useState(iniciales);
  const [estado, setEstado] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    setEstado("Guardando…");
    const resultado = await guardarEspecialidadesLugar(placeId, seleccion);
    setGuardando(false);
    setEstado(resultado.ok ? "Guardado." : resultado.error);
  }

  return (
    <section className="tarjeta grid gap-3">
      <h2 className="text-xl font-semibold">Especialidades que ofrece el lugar</h2>
      <p className="text-sm text-muted">
        Listado institucional (quirófano, guardia, cardiología, etc.). No reemplaza la especialidad de cada profesional.
      </p>
      <div className="flex flex-wrap gap-2">
        {ESPECIALIDADES_CATALOGO.map((item) => {
          const activa = seleccion.includes(item);
          return (
            <label key={item} className={activa ? "pastilla pastilla-activa" : "pastilla"}>
              <input
                className="sr-only"
                type="checkbox"
                checked={activa}
                onChange={(event) =>
                  setSeleccion(
                    event.target.checked ? [...seleccion, item] : seleccion.filter((esp) => esp !== item),
                  )
                }
              />
              {item}
            </label>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="boton-suave" disabled={guardando} onClick={() => void guardar()}>
          {guardando ? "Guardando…" : "Guardar especialidades del lugar"}
        </button>
        {estado ? <p className="text-sm text-muted">{estado}</p> : null}
      </div>
    </section>
  );
}