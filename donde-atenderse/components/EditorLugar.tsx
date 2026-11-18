"use client";

import { useEffect, useRef, useState } from "react";
import { guardarLugar } from "@/actions/place";
import { FichaLugar } from "@/components/FichaLugar";
import { AREAS, DIAS, LOCALIDADES, OBRAS_INICIALES, TIPOS_LUGAR, TURNOS } from "@/lib/constants";
import type { BorradorLugar, EstudioBorrador, HorarioLugarBorrador } from "@/lib/draft";
import { filaHorario } from "@/lib/map";
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
      horarios: ultimo.current.horarios.map((horario) => {
        const guardado = resultado.horarios.find((fila) => fila.key === horario.key);
        return guardado ? { ...horario, id: guardado.id, professionalId: guardado.professionalId } : horario;
      }),
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

  function cambiarHorario(key: string, parcial: Partial<HorarioLugarBorrador>) {
    pendiente.current = true;
    setBorrador((actual) => ({
      ...actual,
      horarios: actual.horarios.map((horario) => (horario.key === key ? { ...horario, ...parcial } : horario)),
    }));
  }

  function cambiarEstudio(key: string, parcial: Partial<EstudioBorrador>) {
    pendiente.current = true;
    setBorrador((actual) => ({
      ...actual,
      studies: actual.studies.map((estudio) => (estudio.key === key ? { ...estudio, ...parcial } : estudio)),
    }));
  }

  const vista = armarVistaLugar({
    name: borrador.name || "Sin nombre",
    kind: borrador.kind,
    locality: borrador.locality,
    address: borrador.address,
    whatsapp: borrador.whatsapp,
    phone: borrador.phone,
    scheduleNote: borrador.scheduleNote,
    obras: [...borrador.obras, borrador.otraObra].map((item) => item.trim()).filter(Boolean),
    updatedAt: new Date(),
    studies: borrador.studies.map((estudio) => ({
      name: estudio.name,
      preparation: estudio.preparation,
      attention: estudio.attention,
    })),
    filas: borrador.horarios
      .filter((horario) => horario.professionalName.trim())
      .map((horario) =>
        filaHorario({
          id: horario.id || horario.key,
          placeId,
          professionalId: horario.professionalId,
          professionalDays: horario.professionalDays.join(","),
          professionalTime: horario.professionalTime,
          professionalShift: horario.professionalShift,
          professionalUpdatedAt: horario.professionalUpdatedAt ? new Date(horario.professionalUpdatedAt) : null,
          placeDays: horario.days.join(","),
          placeTime: horario.time,
          placeShift: horario.shift,
          placeUpdatedAt: new Date(),
          place: { name: borrador.name, locality: borrador.locality },
          professional: { fullName: horario.professionalName },
        }),
      ),
  });

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2">
      <form className="grid gap-8" onSubmit={(event) => event.preventDefault()}>
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
            Teléfono
            <input className="campo" value={borrador.phone} onChange={(event) => cambiar({ phone: event.target.value })} />
          </label>
          <label className="grid gap-1">
            Horario del lugar
            <input className="campo" value={borrador.scheduleNote} onChange={(event) => cambiar({ scheduleNote: event.target.value })} />
          </label>
          <fieldset className="grid gap-2">
            <legend>Obra social</legend>
            {catalogo.map((obra) => (
              <label key={obra} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={borrador.obras.includes(obra)}
                  onChange={(event) =>
                    cambiar({
                      obras: event.target.checked ? [...borrador.obras, obra] : borrador.obras.filter((item) => item !== obra),
                    })
                  }
                />
                {obra}
              </label>
            ))}
            <input className="campo" placeholder="Otra" value={borrador.otraObra} onChange={(event) => cambiar({ otraObra: event.target.value })} />
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

        {borrador.kind === "farmacia" ? null : (
          <section className="grid gap-4">
            <h2 className="text-2xl font-semibold">Quién atiende</h2>
            {borrador.horarios.map((horario) => (
              <div key={horario.key} className="grid gap-3 border-t border-line pt-4">
                {horario.professionalId ? <p className="font-semibold">{horario.professionalName}</p> : null}
                {!horario.professionalId ? (
                  <>
                    <input className="campo" placeholder="Nombre" value={horario.professionalName} onChange={(event) => cambiarHorario(horario.key, { professionalName: event.target.value })} />
                    <input className="campo" placeholder="Especialidad" value={horario.specialty} onChange={(event) => cambiarHorario(horario.key, { specialty: event.target.value })} />
                    <input className="campo" placeholder="Matrícula" value={horario.license} onChange={(event) => cambiarHorario(horario.key, { license: event.target.value })} />
                    <select className="campo" value={horario.area} onChange={(event) => cambiarHorario(horario.key, { area: event.target.value })}>
                      {AREAS.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.label}
                        </option>
                      ))}
                    </select>
                  </>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  {DIAS.map((dia) => (
                    <label key={dia.id} className="flex gap-2">
                      <input
                        type="checkbox"
                        checked={horario.days.includes(dia.id)}
                        onChange={(event) =>
                          cambiarHorario(horario.key, {
                            days: event.target.checked ? [...horario.days, dia.id] : horario.days.filter((item) => item !== dia.id),
                          })
                        }
                      />
                      {dia.label}
                    </label>
                  ))}
                </div>
                <select className="campo" value={horario.shift} onChange={(event) => cambiarHorario(horario.key, { shift: event.target.value })}>
                  {TURNOS.map((turno) => (
                    <option key={turno.id} value={turno.id}>
                      {turno.label}
                    </option>
                  ))}
                </select>
                <input className="campo" placeholder="8 a 12" value={horario.time} onChange={(event) => cambiarHorario(horario.key, { time: event.target.value })} />
                <button type="button" className="w-fit font-semibold text-accent" onClick={() => cambiar({ horarios: borrador.horarios.filter((item) => item.key !== horario.key) })}>
                  Quitar
                </button>
              </div>
            ))}
            <button
              type="button"
              className="boton-suave w-fit"
              onClick={() =>
                cambiar({
                  horarios: [
                    ...borrador.horarios,
                    {
                      key: clave(),
                      professionalName: "",
                      specialty: "",
                      area: "cuerpo",
                      license: "",
                      days: ["lun"],
                      shift: "manana",
                      time: "",
                      professionalDays: [],
                      professionalShift: "",
                      professionalTime: "",
                      professionalUpdatedAt: null,
                    },
                  ],
                })
              }
            >
              Agregar una persona
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
