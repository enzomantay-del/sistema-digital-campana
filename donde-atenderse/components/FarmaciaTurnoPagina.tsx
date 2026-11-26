"use client";

import { useEffect, useId, useState } from "react";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { TarjetaFarmaciaTurno } from "@/components/TarjetaFarmaciaTurno";
import { LOCALIDADES } from "@/lib/constants";
import { fecha } from "@/lib/format";
import { puebloMasCercano } from "@/lib/geo";

export type FarmaciaTurnoPorLocalidad = {
  localidad: (typeof LOCALIDADES)[number];
  vigente: null | {
    nombre: string;
    direccion: string;
    logoUrl: string;
    whatsapp: string;
    telefono: string;
    ejemplo: boolean;
    startsOn: string;
    endsOn: string;
    source: string | null;
  };
  ultimoVencio: string | null;
};

function BloqueLocalidad({ datos, destacar = false }: { datos: FarmaciaTurnoPorLocalidad; destacar?: boolean }) {
  return (
    <section className={`tarjeta grid gap-4 ${destacar ? "ring-2 ring-menta/30" : ""}`}>
      <h2 className="text-2xl font-bold tracking-tight">{datos.localidad}</h2>
      {datos.vigente ? (
        <TarjetaFarmaciaTurno
          nombre={datos.vigente.nombre}
          localidad={datos.localidad}
          direccion={datos.vigente.direccion}
          logoUrl={datos.vigente.logoUrl}
          whatsapp={datos.vigente.whatsapp}
          telefono={datos.vigente.telefono}
          ejemplo={datos.vigente.ejemplo}
          turno={{
            startsOn: new Date(datos.vigente.startsOn),
            endsOn: new Date(datos.vigente.endsOn),
            source: datos.vigente.source,
          }}
        />
      ) : (
        <p className="text-muted">
          Todavía no hay un turno cargado para esta fecha.
          {datos.ultimoVencio ? ` El último venció el ${fecha(datos.ultimoVencio)}.` : ""}
        </p>
      )}
    </section>
  );
}

export function FarmaciaTurnoPagina({ porLocalidad }: { porLocalidad: FarmaciaTurnoPorLocalidad[] }) {
  const idOtra = useId();
  const [ubicacion, setUbicacion] = useState<"pidiendo" | "cerca" | "manual">("pidiendo");
  const [localidadCercana, setLocalidadCercana] = useState<(typeof LOCALIDADES)[number] | "">("");
  const [localidadManual, setLocalidadManual] = useState<(typeof LOCALIDADES)[number] | "">("");
  const [otraLocalidad, setOtraLocalidad] = useState<(typeof LOCALIDADES)[number] | "">("");

  const mapa = new Map(porLocalidad.map((item) => [item.localidad, item]));

  useEffect(() => {
    if (!navigator.geolocation) {
      setUbicacion("manual");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const cerca = puebloMasCercano(posicion.coords.latitude, posicion.coords.longitude);
        if (!cerca || cerca.km > 120) {
          setUbicacion("manual");
          return;
        }
        setLocalidadCercana(cerca.nombre);
        setUbicacion("cerca");
      },
      () => setUbicacion("manual"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }, []);

  const localidadPrincipal =
    ubicacion === "cerca" && localidadCercana
      ? localidadCercana
      : ubicacion === "manual" && localidadManual
        ? localidadManual
        : "";

  const otrasOpciones = LOCALIDADES.filter((loc) => loc !== localidadPrincipal);

  const datosPrincipal = localidadPrincipal ? mapa.get(localidadPrincipal) : undefined;
  const datosOtra = otraLocalidad ? mapa.get(otraLocalidad) : undefined;

  return (
    <div className="grid gap-8">
      {ubicacion === "pidiendo" ? (
        <p className="text-muted" role="status">
          <IconoCercalud nombre="ubicacion" size={18} className="mr-1 inline text-menta" />
          Buscando tu ubicación para mostrar la farmacia de turno de tu ciudad primero…
        </p>
      ) : ubicacion === "cerca" && localidadCercana ? (
        <p className="rounded-2xl border border-line bg-white/90 px-4 py-3 text-base text-ink">
          <span className="font-semibold text-link">Según tu ubicación:</span> {localidadCercana}
        </p>
      ) : (
        <div className="grid gap-2">
          <label className="text-base font-semibold" htmlFor="localidad-principal">
            Tu localidad
          </label>
          <p className="text-sm text-muted">
            No usamos tu ubicación automática. Elegí la ciudad donde estás para ver su farmacia de turno.
          </p>
          <select
            id="localidad-principal"
            className="campo"
            value={localidadManual}
            onChange={(evento) => {
              setLocalidadManual(evento.target.value as (typeof LOCALIDADES)[number] | "");
              setOtraLocalidad("");
            }}
          >
            <option value="">Elegí una localidad</option>
            {LOCALIDADES.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      )}

      {datosPrincipal ? (
        <BloqueLocalidad datos={datosPrincipal} destacar />
      ) : ubicacion !== "pidiendo" ? (
        <p className="text-muted">Elegí tu localidad para ver la farmacia de turno correspondiente.</p>
      ) : null}

      {localidadPrincipal ? (
        <section className="grid gap-3 border-t border-line pt-6">
          <h2 className="text-xl font-semibold">¿Necesitás otra localidad?</h2>
          <p className="text-sm text-muted">
            Si en tu ciudad no podés resolver o preferís ir a otra, consultá el turno en el resto del corredor.
          </p>
          <label className="sr-only" htmlFor={idOtra}>
            Farmacia de turno en otra localidad
          </label>
          <select
            id={idOtra}
            className="campo"
            value={otraLocalidad}
            onChange={(evento) => setOtraLocalidad(evento.target.value as (typeof LOCALIDADES)[number] | "")}
          >
            <option value="">Elegí otra localidad del corredor</option>
            {otrasOpciones.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          {datosOtra ? <BloqueLocalidad datos={datosOtra} /> : null}
        </section>
      ) : null}
    </div>
  );
}