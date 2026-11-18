"use client";

import { useEffect, useRef, useState } from "react";
import { guardarProfesional } from "@/actions/professional";
import { FichaProfesional } from "@/components/FichaProfesional";
import { AREAS, DIAS, LOCALIDADES, OBRAS_INICIALES, TURNOS } from "@/lib/constants";
import type { BorradorProfesional, HorarioBorrador } from "@/lib/draft";
import { armarVistaProfesional } from "@/lib/view";
import type { FilaHorario } from "@/lib/schedule";

function clave() {
  return `tmp-${Math.random().toString(36).slice(2)}`;
}

function horarioVacio(): HorarioBorrador {
  return {
    key: clave(),
    placeName: "",
    locality: "Jardín América",
    address: "",
    ownsPlace: true,
    days: ["lun"],
    shift: "manana",
    time: "",
    placeDays: [],
    placeShift: "",
    placeTime: "",
    placeUpdatedAt: null,
  };
}

export function EditorProfesional({
  inicial,
  lugares,
  obras,
}: {
  inicial: BorradorProfesional & { priceUpdatedAt: string | null };
  lugares: { id: string; name: string; locality: string }[];
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
    const resultado = await guardarProfesional(snapshot);
    guardando.current = false;
    if (!resultado.ok) {
      setEstado(resultado.error);
      return;
    }
    const fusion = {
      ...ultimo.current,
      horarios: ultimo.current.horarios.map((horario) => {
        const guardado = resultado.rows.find((fila) => fila.key === horario.key);
        return guardado ? { ...horario, id: guardado.id, placeId: guardado.placeId } : horario;
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
    const espera = setTimeout(() => {
      void persistir();
    }, 700);
    return () => clearTimeout(espera);
  }, [borrador]);

  function cambiar(parcial: Partial<typeof borrador>) {
    pendiente.current = true;
    setBorrador((actual) => ({ ...actual, ...parcial }));
  }

  function cambiarHorario(key: string, parcial: Partial<HorarioBorrador>) {
    pendiente.current = true;
    setBorrador((actual) => ({
      ...actual,
      horarios: actual.horarios.map((horario) => (horario.key === key ? { ...horario, ...parcial } : horario)),
    }));
  }

  const filas: FilaHorario[] = borrador.horarios
    .filter((horario) => horario.placeName.trim() || horario.placeId)
    .map((horario) => ({
      id: horario.id || horario.key,
      placeId: horario.placeId || horario.key,
      placeName: horario.placeName || "Consultorio",
      locality: horario.locality,
      professionalDays: horario.days.join(","),
      professionalTime: horario.time,
      professionalShift: horario.shift,
      professionalUpdatedAt: new Date(),
      placeDays: horario.ownsPlace ? horario.days.join(",") : horario.placeDays.join(","),
      placeTime: horario.ownsPlace ? horario.time : horario.placeTime,
      placeShift: horario.ownsPlace ? horario.shift : horario.placeShift,
      placeUpdatedAt: horario.placeUpdatedAt ? new Date(horario.placeUpdatedAt) : null,
    }));

  const vista = armarVistaProfesional({
    fullName: borrador.fullName,
    specialty: borrador.specialty,
    area: borrador.area,
    license: borrador.license,
    price: borrador.price,
    priceUpdatedAt:
      borrador.price === inicial.price && inicial.priceUpdatedAt ? new Date(inicial.priceUpdatedAt) : borrador.price ? new Date() : null,
    whatsapp: borrador.whatsapp,
    phone: borrador.phone,
    obras: [...borrador.obras, borrador.otraObra].map((item) => item.trim()).filter(Boolean),
    updatedAt: new Date(),
    filas,
  });

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2">
      <form className="tarjeta grid gap-8" onSubmit={(event) => event.preventDefault()}>
        <p className="text-base text-muted">{estado}</p>
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold">Tus datos</h2>
          <label className="grid gap-1">
            Nombre
            <input className="campo" value={borrador.fullName} onChange={(event) => cambiar({ fullName: event.target.value })} />
          </label>
          <label className="grid gap-1">
            Matrícula
            <input className="campo" value={borrador.license} onChange={(event) => cambiar({ license: event.target.value })} />
          </label>
          <label className="grid gap-1">
            Área
            <select className="campo" value={borrador.area} onChange={(event) => cambiar({ area: event.target.value })}>
              {AREAS.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            Especialidad
            <input
              className="campo"
              value={borrador.specialty}
              list="especialidades"
              onChange={(event) => cambiar({ specialty: event.target.value })}
            />
            <datalist id="especialidades">
              {["Clínica médica", "Pediatría", "Traumatología", "Ginecología", "Cardiología", "Oftalmología", "Psiquiatría", "Psicología", "Odontología", "Kinesiología", "Nutrición"].map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
          <label className="grid gap-1">
            WhatsApp
            <input className="campo" value={borrador.whatsapp} onChange={(event) => cambiar({ whatsapp: event.target.value })} />
          </label>
          <label className="grid gap-1">
            Teléfono
            <input className="campo" value={borrador.phone} onChange={(event) => cambiar({ phone: event.target.value })} />
          </label>
          <fieldset className="grid gap-3">
            <legend className="font-semibold">Obra social</legend>
            <div className="flex flex-wrap gap-2">
              {catalogo.map((obra) => {
                const activa = borrador.obras.includes(obra);
                return (
                  <label key={obra} className={activa ? "pastilla pastilla-activa" : "pastilla"}>
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
            <label className="grid gap-1">
              Otra
              <input className="campo" value={borrador.otraObra} onChange={(event) => cambiar({ otraObra: event.target.value })} />
            </label>
          </fieldset>
          <label className="grid gap-1">
            Precio de la consulta, si querés publicarlo
            <input className="campo" value={borrador.price} onChange={(event) => cambiar({ price: event.target.value })} />
          </label>
        </section>

        <section className="grid gap-5">
          <h2 className="text-2xl font-semibold">Dónde atendés</h2>
          {borrador.horarios.map((horario) => (
            <div key={horario.key} className="grid gap-3 border-t border-line pt-4">
              {horario.placeId && !horario.ownsPlace ? (
                <p>
                  {horario.placeName} · {horario.locality}
                </p>
              ) : (
              <label className="grid gap-1">
                Lugar
                <select
                  className="campo"
                  value={horario.ownsPlace && !horario.placeId ? "__nuevo" : horario.placeId || ""}
                  onChange={(event) => {
                    if (event.target.value === "__nuevo") {
                      cambiarHorario(horario.key, { placeId: undefined, ownsPlace: true, placeName: "", address: "" });
                      return;
                    }
                    const lugar = lugares.find((item) => item.id === event.target.value);
                    if (!lugar) return;
                    cambiarHorario(horario.key, {
                      placeId: lugar.id,
                      ownsPlace: true,
                      placeName: lugar.name,
                      locality: lugar.locality,
                    });
                  }}
                >
                  <option value="">Elegí un lugar</option>
                  <option value="__nuevo">Mi consultorio particular</option>
                  {lugares.map((lugar) => (
                    <option key={lugar.id} value={lugar.id}>
                      {lugar.name} · {lugar.locality}
                    </option>
                  ))}
                </select>
              </label>
              )}
              {horario.ownsPlace && !horario.placeId ? (
                <>
                  <label className="grid gap-1">
                    Nombre del consultorio
                    <input className="campo" value={horario.placeName} onChange={(event) => cambiarHorario(horario.key, { placeName: event.target.value })} />
                  </label>
                  <label className="grid gap-1">
                    Localidad
                    <select className="campo" value={horario.locality} onChange={(event) => cambiarHorario(horario.key, { locality: event.target.value })}>
                      {LOCALIDADES.map((localidad) => (
                        <option key={localidad}>{localidad}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1">
                    Dirección
                    <input className="campo" value={horario.address} onChange={(event) => cambiarHorario(horario.key, { address: event.target.value })} />
                  </label>
                </>
              ) : null}
              <fieldset className="grid gap-2">
                <legend className="font-semibold">Días</legend>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map((dia) => {
                    const activo = horario.days.includes(dia.id);
                    return (
                      <label key={dia.id} className={activo ? "pastilla pastilla-activa" : "pastilla"}>
                        <input
                          className="sr-only"
                          type="checkbox"
                          checked={activo}
                          onChange={(event) =>
                            cambiarHorario(horario.key, {
                              days: event.target.checked ? [...horario.days, dia.id] : horario.days.filter((item) => item !== dia.id),
                            })
                          }
                        />
                        {dia.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <label className="grid gap-1">
                Momento
                <select className="campo" value={horario.shift} onChange={(event) => cambiarHorario(horario.key, { shift: event.target.value })}>
                  {TURNOS.map((turno) => (
                    <option key={turno.id} value={turno.id}>
                      {turno.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                Horario
                <input className="campo" placeholder="8 a 12" value={horario.time} onChange={(event) => cambiarHorario(horario.key, { time: event.target.value })} />
              </label>
              <button
                type="button"
                className="w-fit font-semibold text-accent"
                onClick={() => cambiar({ horarios: borrador.horarios.filter((item) => item.key !== horario.key) })}
              >
                Quitar este lugar
              </button>
            </div>
          ))}
          <button type="button" className="boton-suave w-fit" onClick={() => cambiar({ horarios: [...borrador.horarios, horarioVacio()] })}>
            Agregar un lugar
          </button>
        </section>
      </form>
      <aside className="grid gap-3 lg:sticky lg:top-24">
        <h2 className="text-2xl font-semibold">Así lo ve el paciente</h2>
        <FichaProfesional vista={vista} enlazar={false} />
      </aside>
    </div>
  );
}
