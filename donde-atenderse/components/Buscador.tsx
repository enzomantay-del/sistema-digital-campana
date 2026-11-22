"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarProfesionalListado, LogoLugarListado } from "@/components/MediaListado";
import { InsigniaVerificacion } from "@/components/InsigniaVerificacion";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { AREAS, LOCALIDADES } from "@/lib/constants";
import { puebloMasCercano } from "@/lib/geo";

const MINIMO_BUSQUEDA = 3;

type SugerenciaPersona = {
  id: string;
  nombre: string;
  especialidad: string;
  photoUrl: string;
  verificado: boolean;
};
type SugerenciaLugar = {
  id: string;
  nombre: string;
  tipo: string;
  localidad: string;
  logoUrl: string;
  verificado: boolean;
};

export function Buscador({
  q = "",
  localidad = "",
  area = "",
  obra = "",
  obras = [],
  estudios = false,
  centrosSalud = false,
  mostrarArea = false,
  placeholder = "Nombre del profesional, especialidad o centro de salud",
}: {
  q?: string;
  localidad?: string;
  area?: string;
  obra?: string;
  obras?: string[];
  estudios?: boolean;
  centrosSalud?: boolean;
  mostrarArea?: boolean;
  placeholder?: string;
}) {
  const router = useRouter();
  const listaId = useId();
  const caja = useRef<HTMLDivElement>(null);
  const [texto, setTexto] = useState(q);
  const [personas, setPersonas] = useState<SugerenciaPersona[]>([]);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [lugares, setLugares] = useState<SugerenciaLugar[]>([]);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [ubicacion, setUbicacion] = useState<"pidiendo" | "cerca" | "manual">("pidiendo");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pueblo, setPueblo] = useState("");

  const haySugerencias = personas.length > 0 || especialidades.length > 0 || lugares.length > 0;

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
        setCoords({ lat: posicion.coords.latitude, lng: posicion.coords.longitude });
        setPueblo(cerca.nombre);
        setUbicacion("cerca");
      },
      () => setUbicacion("manual"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }, []);

  useEffect(() => {
    const consulta = texto.trim();
    if (consulta.length < MINIMO_BUSQUEDA) {
      setPersonas([]);
      setEspecialidades([]);
      setLugares([]);
      setAbierto(false);
      setCargandoSugerencias(false);
      return;
    }
    const control = new AbortController();
    setCargandoSugerencias(true);
    const espera = window.setTimeout(async () => {
      try {
        const respuesta = await fetch(`/api/sugerencias?q=${encodeURIComponent(consulta)}`, { signal: control.signal });
        if (!respuesta.ok) return;
        const datos = (await respuesta.json()) as {
          personas: SugerenciaPersona[];
          especialidades: string[];
          lugares: SugerenciaLugar[];
        };
        setPersonas(datos.personas);
        setEspecialidades(datos.especialidades);
        setLugares(datos.lugares ?? []);
        setAbierto(datos.personas.length > 0 || datos.especialidades.length > 0 || (datos.lugares?.length ?? 0) > 0);
      } catch {
        if (!control.signal.aborted) setAbierto(false);
      } finally {
        if (!control.signal.aborted) setCargandoSugerencias(false);
      }
    }, 150);
    return () => {
      control.abort();
      window.clearTimeout(espera);
    };
  }, [texto]);

  useEffect(() => {
    function cerrar(evento: MouseEvent) {
      if (!caja.current?.contains(evento.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  function irABuscar(consulta: string) {
    const params = new URLSearchParams({ q: consulta });
    if (obra) params.set("obra", obra);
    if (estudios) params.set("estudios", "1");
    if (centrosSalud) params.set("centros", "1");
    if (coords && ubicacion === "cerca") {
      params.set("lat", String(coords.lat));
      params.set("lng", String(coords.lng));
    }
    router.push(`/buscar?${params.toString()}`);
  }

  return (
    <form action="/buscar" className="grid gap-3 text-left">
      {estudios ? <input type="hidden" name="estudios" value="1" /> : null}
      {centrosSalud ? <input type="hidden" name="centros" value="1" /> : null}
      {ubicacion === "cerca" && coords ? (
        <>
          <input type="hidden" name="lat" value={coords.lat} />
          <input type="hidden" name="lng" value={coords.lng} />
        </>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div ref={caja} className="campo-buscar-con-icono relative min-w-0 flex-1">
          <IconoCercalud
            nombre="buscar"
            size={22}
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-link"
          />
          <label className="sr-only" htmlFor="q">
            Profesional, especialidad o centro de salud
          </label>
          <input
            id="q"
            name="q"
            value={texto}
            role="combobox"
            aria-expanded={abierto}
            aria-controls={listaId}
            aria-autocomplete="list"
            autoComplete="off"
            placeholder={placeholder}
            className="campo-buscar"
            onChange={(evento) => {
              setTexto(evento.target.value);
              if (evento.target.value.trim().length >= MINIMO_BUSQUEDA) setAbierto(true);
            }}
            onFocus={() => {
              if (texto.trim().length >= MINIMO_BUSQUEDA && (haySugerencias || cargandoSugerencias)) setAbierto(true);
            }}
          />
          {abierto && texto.trim().length >= MINIMO_BUSQUEDA ? (
            <ul
              id={listaId}
              role="listbox"
              className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-line bg-white py-2 text-left shadow-[0_12px_32px_rgba(18,39,92,0.12)]"
            >
              {cargandoSugerencias && !haySugerencias ? (
                <li className="px-4 py-2 text-sm text-muted">Buscando…</li>
              ) : null}
              {!cargandoSugerencias && !haySugerencias ? (
                <li className="px-4 py-2 text-sm text-muted">No hay coincidencias todavía.</li>
              ) : null}
              {lugares.map((lugar) => (
                <li key={lugar.id}>
                  <button
                    type="button"
                    className="flex w-full gap-2.5 px-4 py-2 text-left hover:bg-paper"
                    onMouseDown={(evento) => evento.preventDefault()}
                    onClick={() => {
                      setAbierto(false);
                      router.push(`/lugar/${lugar.id}`);
                    }}
                  >
                    <LogoLugarListado nombre={lugar.nombre} logoUrl={lugar.logoUrl} tamano="chico" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-1">
                        <span className="block text-xs font-bold uppercase tracking-[0.06em] text-menta">Centro de salud</span>
                        <InsigniaVerificacion activa={lugar.verificado} compacta />
                      </span>
                      <span className="block font-semibold">{lugar.nombre}</span>
                      <span className="text-sm text-muted">
                        {lugar.tipo} · {lugar.localidad}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {especialidades.map((especialidad) => (
                <li key={especialidad}>
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left hover:bg-paper"
                    onMouseDown={(evento) => evento.preventDefault()}
                    onClick={() => {
                      setTexto(especialidad);
                      setAbierto(false);
                      irABuscar(especialidad);
                    }}
                  >
                    <span className="block text-xs font-bold uppercase tracking-[0.06em] text-menta">Especialidad</span>
                    {especialidad}
                  </button>
                </li>
              ))}
              {personas.map((persona) => (
                <li key={persona.id}>
                  <button
                    type="button"
                    className="flex w-full gap-2.5 px-4 py-2 text-left hover:bg-paper"
                    onMouseDown={(evento) => evento.preventDefault()}
                    onClick={() => {
                      setAbierto(false);
                      router.push(`/profesional/${persona.id}`);
                    }}
                  >
                    <AvatarProfesionalListado nombre={persona.nombre} photoUrl={persona.photoUrl} tamano="chico" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-1">
                        <span className="block text-xs font-bold uppercase tracking-[0.06em] text-menta">Profesional</span>
                        <InsigniaVerificacion activa={persona.verificado} compacta />
                      </span>
                      <span className="block font-semibold">{persona.nombre}</span>
                      <span className="text-sm text-muted">{persona.especialidad}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <button className="boton shrink-0 gap-2" type="submit">
          <IconoCercalud nombre="buscar" size={20} className="text-white/95" />
          Buscar
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm text-muted">
          Obra social
          <select name="obra" defaultValue={obra} className="campo">
            <option value="">Todas</option>
            {obras.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        {ubicacion === "cerca" ? (
          <p className="self-end text-sm text-muted">
            Ordenado desde donde estás, cerca de {pueblo}. La ubicación no se guarda.
          </p>
        ) : (
          <label className="grid gap-1 text-sm text-muted">
            {ubicacion === "pidiendo" ? "Buscando tu ubicación" : "Localidad"}
            <select name="localidad" defaultValue={localidad} className="campo" disabled={ubicacion === "pidiendo"}>
              <option value="">{ubicacion === "pidiendo" ? "Un momento" : "Todas"}</option>
              {LOCALIDADES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {ubicacion === "manual" ? (
        <p className="text-sm text-muted">Sin la ubicación activada, podés elegir el pueblo.</p>
      ) : null}
      {mostrarArea ? (
        <label className="grid max-w-sm gap-1 text-sm text-muted">
          Área
          <select name="area" defaultValue={area} className="campo">
            <option value="">Todas</option>
            {AREAS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </form>
  );
}