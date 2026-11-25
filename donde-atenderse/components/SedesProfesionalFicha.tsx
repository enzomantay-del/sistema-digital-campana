"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { EnlacesContactoLugar } from "@/components/EnlacesContactoLugar";
import { ListaHorarioTexto } from "@/components/ListaHorarioTexto";
import { ListaObrasCompacta } from "@/components/ListaObrasCompacta";
import { puebloMasCercano } from "@/lib/geo";
import { ordenarSedesPorCercania } from "@/lib/ordenSedesProfesional";
import type { VistaSedeProfesional } from "@/lib/view";

export function SedesProfesionalFicha({
  sedes,
  fichaDensa,
  ejemplo,
  enlazar,
}: {
  sedes: VistaSedeProfesional[];
  fichaDensa: boolean;
  ejemplo: boolean;
  enlazar: boolean;
}) {
  const [ordenadas, setOrdenadas] = useState(sedes);
  const [cercaDe, setCercaDe] = useState<string | null>(null);

  useEffect(() => {
    setOrdenadas(sedes);
    setCercaDe(null);
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pueblo = puebloMasCercano(pos.coords.latitude, pos.coords.longitude);
        if (!pueblo || pueblo.km > 120) return;
        setOrdenadas(ordenarSedesPorCercania(sedes, pos.coords.latitude, pos.coords.longitude));
        setCercaDe(pueblo.nombre);
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }, [sedes]);

  return (
    <div className={fichaDensa ? "grid gap-3" : "grid gap-6"}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className={`enlace-icono ${fichaDensa ? "text-xl font-semibold" : "text-2xl font-semibold"}`}>
          <IconoCercalud nombre="ubicacion" size={fichaDensa ? 20 : 24} className="shrink-0 text-menta" />
          Dónde atiende
        </h2>
        {cercaDe ? <p className="text-xs text-muted">Ordenado por cercanía a {cercaDe}</p> : null}
      </div>
      <div
        className={
          fichaDensa
            ? "divide-y divide-line overflow-hidden rounded-2xl border border-line"
            : "grid gap-4"
        }
      >
        {ordenadas.map((sede) => (
          <section
            key={sede.placeId}
            className={fichaDensa ? "grid gap-2 px-3 py-3" : "grid gap-3 rounded-2xl border border-line px-4 py-4"}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0">
              <div className="enlace-icono min-w-0">
                <IconoCercalud
                  nombre="centro-salud"
                  size={fichaDensa ? 16 : 20}
                  className="shrink-0 text-menta"
                />
                {enlazar ? (
                  <Link
                    href={`/lugar/${sede.placeId}`}
                    className={fichaDensa ? "text-lg font-semibold text-link" : "text-xl font-semibold text-link"}
                  >
                    {sede.placeName}
                  </Link>
                ) : (
                  <p className={fichaDensa ? "text-lg font-semibold" : "text-xl font-semibold"}>{sede.placeName}</p>
                )}
              </div>
              {sede.locality ? (
                <span className="enlace-icono text-xs text-muted">
                  <IconoCercalud nombre="ubicacion" size={12} className="shrink-0 text-menta/80" />
                  {sede.locality}
                </span>
              ) : null}
            </div>

            <div className={fichaDensa ? "grid gap-2" : "grid gap-3"}>
              {sede.turnos.map((turno) => (
                <div key={turno.shift} className="grid gap-1.5">
                  {sede.turnos.length > 1 || turno.shift === "guardia" ? (
                    <p className={fichaDensa ? "text-sm font-semibold text-ink" : "text-base font-semibold"}>
                      {turno.titulo}
                    </p>
                  ) : null}
                  {turno.shift === "guardia" ? (
                    <p className={fichaDensa ? "text-xs text-muted" : "text-sm text-muted"}>
                      Es una guardia, no un horario de consultorio.
                    </p>
                  ) : null}
                  {turno.lineas.map((linea) => (
                    <div key={linea.id} className="grid gap-1">
                      {(linea.horarioLineas.length > 0 || linea.detalle) && (
                        <div className="flex gap-2">
                          <IconoCercalud
                            nombre="reloj"
                            size={fichaDensa ? 14 : 16}
                            className="mt-0.5 shrink-0 text-menta/85"
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <ListaHorarioTexto
                              lineas={linea.horarioLineas.length > 0 ? linea.horarioLineas : [linea.detalle]}
                              denso={fichaDensa}
                            />
                          </div>
                        </div>
                      )}
                      {linea.conflictoTexto ? (
                        <p className={fichaDensa ? "text-xs text-warn" : "text-sm text-warn"}>{linea.conflictoTexto}</p>
                      ) : null}
                      {!fichaDensa ? <p className="text-xs text-muted">{linea.actualizacion}</p> : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {sede.obras.length > 0 ? (
              <ListaObrasCompacta obras={sede.obras} etiqueta="Obras sociales en este lugar" />
            ) : null}
            {sede.placeWhatsapp || sede.placePhone ? (
              <EnlacesContactoLugar whatsapp={sede.placeWhatsapp} telefono={sede.placePhone} ejemplo={ejemplo} />
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}