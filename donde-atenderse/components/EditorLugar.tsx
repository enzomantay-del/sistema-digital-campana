"use client";

import { useEffect, useRef, useState } from "react";
import { guardarLugar } from "@/actions/place";
import { FichaLugar } from "@/components/FichaLugar";
import { DIAS, LOCALIDADES, OBRAS_INICIALES, TIPOS_LUGAR, TURNOS } from "@/lib/constants";
import type { BorradorLugar, EstudioBorrador } from "@/lib/draft";
import { notaHorarioLugar } from "@/lib/format";
import { armarVistaLugar } from "@/lib/view";

function clave() {
  return `tmp-${Math.random().toString(36).slice(2)}`;
}

export function EditorLugar({
  placeId,
  inicial,
  obras,
}: {
  placeId: string;
  inicial: BorradorLugar;
  obras: string[];
}) {
  const [borrador, setBorrador] = useState(inicial);
  const [estado, setEstado] = useState("Se guarda solo.");
  const ultimo = useRef(borrador);
  const guardando = useRef(false);
  const pendiente = useRef(false);
  const silencio = useRef(false);
  const montado = useRef(false);
  ultimo.current = borrador;
  const catalogo = Array.from(new Set([...OBRAS_INICIALES, ...obras])).sort((a, b) => a.localeCompare(b, "es"));

  async function persistir() {
    if (guardando.current) {
      pendiente.current = true;
      return;
    }
    const snapshot = ultimo.current;
    guardando.current = true;
    pendiente.current = false;
    setEstado("Guardando…");
    const resultado = await guardarLugar(placeId, snapshot);
    guardando.current = false;
    if (!resultado.ok) {
      setEstado(resultado.error);
      return;
    }
    const fusion = {
      ...ultimo.current,
      studies: ultimo.current.studies.map((estudio) => {
        const guardado = resultado.studies.find((fila) => fila.key === estudio.key);
        return guardado ? { ...estudio, id: guardado.id } : estudio;
      }),
    };
    ultimo.current = fusion;
    silencio.current = true;
    setBorrador(fusion);
    setEstado("Guardado.");
    if (pendiente.current) void persistir();
  }

  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }
    if (silencio.current) {
      silencio.current = false;
      return;
    }
    const espera = setTimeout(() => void persistir(), 700);
    return () => clearTimeout(espera);
  }, [borrador]);

  function cambiar(parcial: Partial<BorradorLugar>) {
    pendiente.current = true;
    setBorrador((actual) => ({ ...actual, ...parcial }));
  }

  function cambiarHorarioLugar(parcial: Pick<BorradorLugar, "scheduleDays" | "scheduleShift" | "scheduleTime">) {
    pendiente.current = true;
    setBorrador((actual) => {
      const siguiente = { ...actual, ...parcial };
      return {
        ...siguiente,
        scheduleNote: notaHorarioLugar(siguiente.scheduleDays, siguiente.scheduleShift, siguiente.scheduleTime),
      };
    });
  }

  function cambiarEstudio(key: string, parcial: Partial<EstudioBorrador>) {
    pendiente.current = true;
    setBorrador((actual) => ({
      ...actual,
      studies: actual.studies.map((estudio) => (estudio.key === key ? { ...estudio, ...parcial } : estudio)),
    }));
  }

  const horarioVista =
    notaHorarioLugar(borrador.scheduleDays, borrador.scheduleShift, borrador.scheduleTime) || borrador.scheduleNote;

  const vista = armarVistaLugar({
    name: borrador.name || "Sin nombre",
    kind: borrador.kind,
    locality: borrador.locality,
    address: borrador.address,
    whatsapp: borrador.whatsapp,
    phone: borrador.phone,
    scheduleNote: horarioVista,
    obras: [...borrador.obras, borrador.otraObra].map((item) => item.trim()).filter(Boolean).sort((a, b) => a.localeCompare(b, "es")),
    updatedAt: new Date(),
    studies: borrador.studies.map((estudio) => ({
      name: estudio.name,
      preparation: estudio.preparation,
      attention: estudio.attention,
    })),
    filas: [],
  });

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2">
      <form className="tarjeta grid gap-8" onSubmit={(event) => event.preventDefault()}>
        <p className="text-base text-muted">{estado}</p>
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold">El lugar</h2>
          <label className="grid gap-1">
            Nombre
            <input className="campo" value={borrador.name} onChange={(event) => cambiar({ name: event.target.value })} />
          </label>
          <label className="grid gap-1">
            Tipo
            <select className="campo" value={borrador.kind} onChange={(event) => cambiar({ kind: event.target.value })}>
              {TIPOS_LUGAR.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            Localidad
            <select className="campo" value={borrador.locality} onChange={(event) => cambiar({ locality: event.target.value })}>
              {LOCALIDADES.map((localidad) => (
                <option key={localidad}>{localidad}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            Dirección
            <input className="campo" value={borrador.address} onChange={(event) => cambiar({ address: event.target.value })} />
          </label>
          <label className="grid gap-1">
            WhatsApp
            <input className="campo" value={borrador.whatsapp} onChange={(event) => cambiar({ whatsapp: event.target.value })} />
          </label>
          <label className="grid gap-1">
            Teléfono fijo
            <input className="campo" value={borrador.phone} onChange={(event) => cambiar({ phone: event.target.value })} />
          </label>
          <fieldset className="grid gap-3">
            <legend className="font-semibold">Horario del lugar</legend>
            <div className="flex flex-wrap gap-2">
              {DIAS.map((dia) => {
                const activo = borrador.scheduleDays.includes(dia.id);
                return (
                  <label key={dia.id} className={activo ? "pastilla pastilla-activa" : "pastilla"}>
                    <input
                      className="sr-only"
                      type="checkbox"
                      checked={activo}
                      onChange={(event) =>
                        cambiarHorarioLugar({
                          scheduleDays: event.target.checked
                            ? [...borrador.scheduleDays, dia.id]
                            : borrador.scheduleDays.filter((item) => item !== dia.id),
                          scheduleShift: borrador.scheduleShift,
                          scheduleTime: borrador.scheduleTime,
                        })
                      }
                    />
                    {dia.label}
                  </label>
                );
              })}
            </div>
            <select
              className="campo"
              value={borrador.scheduleShift}
              onChange={(event) =>
                cambiarHorarioLugar({
                  scheduleDays: borrador.scheduleDays,
                  scheduleShift: event.target.value,
                  scheduleTime: borrador.scheduleTime,
                })
              }
            >
              {TURNOS.map((turno) => (
                <option key={turno.id} value={turno.id}>
                  {turno.label}
                </option>
              ))}
            </select>
            <input
              className="campo"
              placeholder="8 a 12"
              value={borrador.scheduleTime}
              onChange={(event) =>
                cambiarHorarioLugar({
                  scheduleDays: borrador.scheduleDays,
                  scheduleShift: borrador.scheduleShift,
                  scheduleTime: event.target.value,
                })
              }
            />
            {borrador.scheduleNote && borrador.scheduleDays.length === 0 && !borrador.scheduleTime ? (
              <p className="text-sm text-muted">Horario cargado antes: {borrador.scheduleNote}</p>
            ) : null}
          </fieldset>
          <fieldset className="grid gap-3">
            <legend className="font-semibold">Obras sociales</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {catalogo.map((obra) => {
                const activa = borrador.obras.includes(obra);
                return (
                  <label key={obra} className={activa ? "pastilla pastilla-compacta pastilla-activa" : "pastilla pastilla-compacta"}>
                    <input
                      className="sr-only"
                      type="checkbox"
                      checked={activa}
                      onChange={(event) =>
                        cambiar({
                          obras: event.target.checked ? [...borrador.obras, obra] : borrador.obras.filter((item) => item !== obra),
                        })
                      }
                    />
                    {obra}
                  </label>
                );
              })}
            </div>
            <input className="campo" placeholder="Otra obra social" value={borrador.otraObra} onChange={(event) => cambiar({ otraObra: event.target.value })} />
          </fieldset>
        </section>

        {borrador.kind === "farmacia" ? (
          <section className="grid gap-4">
            <h2 className="text-2xl font-semibold">Turno</h2>
            <label className="grid gap-1">
              Desde
              <input className="campo" type="date" value={borrador.dutyStart} onChange={(event) => cambiar({ dutyStart: event.target.value })} />
            </label>
            <label className="grid gap-1">
              Hasta
              <input className="campo" type="date" value={borrador.dutyEnd} onChange={(event) => cambiar({ dutyEnd: event.target.value })} />
            </label>
            <label className="grid gap-1">
              Fuente
              <input className="campo" value={borrador.dutySource} onChange={(event) => cambiar({ dutySource: event.target.value })} />
            </label>
          </section>
        ) : (
          <section className="grid gap-4">
            <h2 className="text-2xl font-semibold">Estudios</h2>
            {borrador.studies.map((estudio) => (
              <div key={estudio.key} className="grid gap-3 border-t border-line pt-4">
                <input className="campo" placeholder="Nombre del estudio" value={estudio.name} onChange={(event) => cambiarEstudio(estudio.key, { name: event.target.value })} />
                <select className="campo" value={estudio.attention} onChange={(event) => cambiarEstudio(estudio.key, { attention: event.target.value })}>
                  <option value="">Sin aclarar</option>
                  <option value="turno">Con turno</option>
                  <option value="orden">Por orden de llegada</option>
                </select>
                <input className="campo" placeholder="Preparación, si hace falta" value={estudio.preparation} onChange={(event) => cambiarEstudio(estudio.key, { preparation: event.target.value })} />
                <button type="button" className="w-fit font-semibold text-accent" onClick={() => cambiar({ studies: borrador.studies.filter((item) => item.key !== estudio.key) })}>
                  Quitar estudio
                </button>
              </div>
            ))}
            <button
              type="button"
              className="boton-suave w-fit"
              onClick={() => cambiar({ studies: [...borrador.studies, { key: clave(), name: "", preparation: "", attention: "turno" }] })}
            >
              Agregar un estudio
            </button>
          </section>
        )}
      </form>
      <aside className="grid gap-3 lg:sticky lg:top-24">
        <h2 className="text-2xl font-semibold">Así lo ve el paciente</h2>
        {borrador.kind === "farmacia" ? (
          <p>
            {borrador.name || "Farmacia"} · {borrador.locality}. El turno se publica en Farmacia de turno
            {borrador.dutyStart && borrador.dutyEnd ? `, del ${borrador.dutyStart} al ${borrador.dutyEnd}` : ""}.
          </p>
        ) : (
          <FichaLugar vista={vista} enlazar={false} />
        )}
      </aside>
    </div>
  );
}