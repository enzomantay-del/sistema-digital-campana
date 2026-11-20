"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AccionesAdmin } from "@/components/AccionesAdmin";
import { etiquetaArea, etiquetaLugar, normalizar } from "@/lib/format";

export type FilaAdmin = {
  id: string;
  titulo: string;
  detalle: string;
  extra?: string;
  hrefEditar?: string;
  published: boolean;
  reviewed?: boolean;
  example: boolean;
  locality?: string;
  kind?: string;
  area?: string;
  sugerido?: boolean;
};

type AccionesLote = {
  publicar: (formData: FormData) => void | Promise<void>;
  bajar: (formData: FormData) => void | Promise<void>;
  eliminar: (formData: FormData) => void | Promise<void>;
};

function claseLote(variante: "publicar" | "bajar" | "eliminar") {
  if (variante === "publicar") return "boton";
  if (variante === "eliminar") return "font-semibold text-warn";
  return "boton-suave";
}

function FormularioLote({
  ids,
  accion,
  etiqueta,
  variante,
  confirmar,
}: {
  ids: string[];
  accion: (formData: FormData) => void | Promise<void>;
  etiqueta: string;
  variante: "publicar" | "bajar" | "eliminar";
  confirmar?: string;
}) {
  const deshabilitado = ids.length === 0;
  return (
    <form
      action={accion}
      onSubmit={(event) => {
        if (deshabilitado) {
          event.preventDefault();
          return;
        }
        if (confirmar && !window.confirm(confirmar)) {
          event.preventDefault();
        }
      }}
    >
      {ids.map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}
      <button className={claseLote(variante)} type="submit" disabled={deshabilitado}>
        {etiqueta}
        {ids.length > 0 ? ` (${ids.length})` : ""}
      </button>
    </form>
  );
}

export function GestionAdminLista({
  filas,
  vacio,
  etiquetaItem,
  acciones,
  filtros,
}: {
  filas: FilaAdmin[];
  vacio: string;
  etiquetaItem: string;
  acciones: AccionesLote;
  filtros: "profesional" | "lugar";
}) {
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [tipo, setTipo] = useState("");
  const [area, setArea] = useState("");
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());

  const localidades = useMemo(
    () => [...new Set(filas.map((fila) => fila.locality).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "es")),
    [filas],
  );
  const tipos = useMemo(
    () => [...new Set(filas.map((fila) => fila.kind).filter(Boolean) as string[])],
    [filas],
  );
  const areas = useMemo(() => [...new Set(filas.map((fila) => fila.area).filter(Boolean) as string[])], [filas]);

  const visibles = useMemo(() => {
    const consulta = normalizar(texto);
    return filas.filter((fila) => {
      if (consulta) {
        const bloque = normalizar([fila.titulo, fila.detalle, fila.extra ?? ""].join(" "));
        if (!bloque.includes(consulta)) return false;
      }
      if (estado === "publicada" && !fila.published) return false;
      if (estado === "sin-publicar" && fila.published) return false;
      if (estado === "sin-revisar" && fila.reviewed !== false) return false;
      if (estado === "ejemplo" && !fila.example) return false;
      if (estado === "sugerido" && !fila.sugerido) return false;
      if (localidad && fila.locality !== localidad) return false;
      if (tipo && fila.kind !== tipo) return false;
      if (area && fila.area !== area) return false;
      return true;
    });
  }, [area, estado, filas, localidad, texto, tipo]);

  const idsVisibles = visibles.map((fila) => fila.id);
  const idsSeleccionados = idsVisibles.filter((id) => seleccion.has(id));
  const todosVisibles = idsVisibles.length > 0 && idsVisibles.every((id) => seleccion.has(id));

  function alternar(id: string) {
    setSeleccion((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  function alternarVisibles() {
    setSeleccion((actual) => {
      const siguiente = new Set(actual);
      if (todosVisibles) {
        for (const id of idsVisibles) siguiente.delete(id);
      } else {
        for (const id of idsVisibles) siguiente.add(id);
      }
      return siguiente;
    });
  }

  return (
    <div className="grid gap-2.5">
      <div className="grid gap-2 rounded-2xl border border-line bg-white p-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-0.5 sm:col-span-2 lg:col-span-2">
          Buscar
          <input
            className="campo"
            placeholder={`Nombre del ${etiquetaItem}`}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
          />
        </label>
        <label className="grid gap-0.5">
          Estado
          <select className="campo" value={estado} onChange={(event) => setEstado(event.target.value)}>
            <option value="">Todos</option>
            <option value="publicada">{filtros === "lugar" ? "Publicados" : "Publicadas"}</option>
            <option value="sin-publicar">Sin publicar</option>
            {filtros === "profesional" ? <option value="sin-revisar">Sin revisar</option> : null}
            {filtros === "lugar" ? <option value="sugerido">Sugeridos</option> : null}
            <option value="ejemplo">Datos de ejemplo</option>
          </select>
        </label>
        {filtros === "lugar" ? (
          <>
            <label className="grid gap-0.5">
              Localidad
              <select className="campo" value={localidad} onChange={(event) => setLocalidad(event.target.value)}>
                <option value="">Todas</option>
                {localidades.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-0.5">
              Tipo
              <select className="campo" value={tipo} onChange={(event) => setTipo(event.target.value)}>
                <option value="">Todos</option>
                {tipos.map((item) => (
                  <option key={item} value={item}>
                    {etiquetaLugar(item)}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <label className="grid gap-0.5">
            Área
            <select className="campo" value={area} onChange={(event) => setArea(event.target.value)}>
              <option value="">Todas</option>
              {areas.map((item) => (
                <option key={item} value={item}>
                  {etiquetaArea(item)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2">
        <label className="flex items-center gap-1.5 text-[0.8125rem] font-semibold">
          <input className="size-3.5 accent-accent" type="checkbox" checked={todosVisibles} onChange={alternarVisibles} />
          Seleccionar visibles ({visibles.length})
        </label>
        <FormularioLote ids={idsSeleccionados} accion={acciones.publicar} etiqueta="Publicar" variante="publicar" />
        <FormularioLote ids={idsSeleccionados} accion={acciones.bajar} etiqueta="Bajar" variante="bajar" />
        <FormularioLote
          ids={idsSeleccionados}
          accion={acciones.eliminar}
          etiqueta="Eliminar"
          variante="eliminar"
          confirmar={
            idsSeleccionados.length > 0
              ? `¿Eliminar ${idsSeleccionados.length} ${etiquetaItem}${idsSeleccionados.length === 1 ? "" : "s"} seleccionados? No se puede deshacer.`
              : undefined
          }
        />
        <p className="ml-auto text-[0.8125rem] text-muted">
          Mostrando {visibles.length} de {filas.length}
        </p>
      </div>

      {visibles.length === 0 ? (
        <p className="text-sm text-muted">{filas.length === 0 ? vacio : "Ningún resultado con estos filtros."}</p>
      ) : (
        <ul className="grid gap-0">
          {visibles.map((fila) => (
            <li
              key={fila.id}
              className="grid gap-2 border-t border-line py-2 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-3"
            >
              <label className="flex items-center">
                <input
                  className="size-3.5 accent-accent"
                  type="checkbox"
                  checked={seleccion.has(fila.id)}
                  onChange={() => alternar(fila.id)}
                />
              </label>
              <div className="min-w-0">
                {fila.hrefEditar ? (
                  <Link href={fila.hrefEditar} className="text-[0.9375rem] font-semibold hover:text-link">
                    {fila.titulo}
                  </Link>
                ) : (
                  <p className="text-[0.9375rem] font-semibold leading-snug">{fila.titulo}</p>
                )}
                <p className="text-[0.8125rem] leading-snug text-muted">
                  {[fila.detalle, fila.extra].filter(Boolean).join(" · ")}
                </p>
              </div>
              <AccionesAdmin
                compacto
                extra={
                  fila.hrefEditar ? (
                    <Link href={fila.hrefEditar} className="font-semibold text-link">
                      Editar
                    </Link>
                  ) : undefined
                }
                acciones={[
                  {
                    label: "Publicar",
                    action: acciones.publicar,
                    id: fila.id,
                  },
                  {
                    label: "Bajar",
                    action: acciones.bajar,
                    id: fila.id,
                  },
                  {
                    label: "Eliminar",
                    action: acciones.eliminar,
                    id: fila.id,
                    tono: "peligro",
                    confirmar: `¿Eliminar ${fila.titulo}? No se puede deshacer.`,
                  },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
