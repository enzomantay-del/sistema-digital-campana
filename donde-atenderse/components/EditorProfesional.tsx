"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { guardarProfesional, guardarProfesionalAdmin } from "@/actions/professional";
import { FichaProfesional } from "@/components/FichaProfesional";
import { FotoProfesionalEditor } from "@/components/FotoProfesionalEditor";
import { HorarioLugarEditor } from "@/components/HorarioLugarEditor";
import { AREAS, LOCALIDADES, OBRAS_INICIALES, TIPOS_LUGAR } from "@/lib/constants";
import type { BorradorProfesional, HorarioBorrador } from "@/lib/draft";
import { horarioLugarParaGuardar, horarioLugarVacio, notaHorarioParaGuardar } from "@/lib/placeSchedule";
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
    kind: "consultorio",
    ownsPlace: false,
    sugerido: false,
    publicado: true,
    schedule: horarioLugarVacio(),
    scheduleLegacy: null,
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
  revisada,
  publicada,
  modoAdmin = false,
  professionalId,
  ejemplo = false,
}: {
  inicial: BorradorProfesional & { priceUpdatedAt: string | null };
  lugares: { id: string; name: string; locality: string; kind: string }[];
  obras: string[];
  revisada: boolean;
  publicada: boolean;
  modoAdmin?: boolean;
  professionalId: string;
  ejemplo?: boolean;
}) {
  const [borrador, setBorrador] = useState(inicial);
  const [hayCambios, setHayCambios] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [estado, setEstado] = useState("Cuando termines, tocá Guardar ficha para que quede en la ficha pública.");
  const ultimo = useRef(borrador);
  ultimo.current = borrador;
  const catalogo = Array.from(new Set([...OBRAS_INICIALES, ...obras])).sort((a, b) => a.localeCompare(b, "es"));

  function marcarCambio() {
    setHayCambios(true);
    setGuardadoOk(false);
    setEstado("Tenés cambios sin guardar.");
  }

  async function guardarFicha() {
    if (guardando) return;
    const snapshot = ultimo.current;
    setGuardando(true);
    setEstado("Guardando…");
    try {
      const resultado =
        modoAdmin && professionalId
          ? await guardarProfesionalAdmin(professionalId, snapshot)
          : await guardarProfesional(snapshot);
      if (!resultado?.ok) {
        setEstado(resultado?.error ?? "No se pudo guardar. Probá de nuevo.");
        return;
      }
      const fusion = {
        ...ultimo.current,
        horarios: ultimo.current.horarios.map((horario) => {
          const guardado = resultado.rows.find((fila) => fila.key === horario.key);
          if (!guardado) return { ...horario, scheduleLegacy: null };
          return {
            ...horario,
            id: guardado.id,
            placeId: guardado.placeId,
            scheduleLegacy: null,
            sugerido: horario.sugerido && !horario.publicado ? true : horario.sugerido,
            publicado: horario.sugerido ? false : horario.publicado,
          };
        }),
      };
      ultimo.current = fusion;
      setBorrador(fusion);
      setHayCambios(false);
      setGuardadoOk(true);
      setEstado(
        modoAdmin
          ? "Guardado. Los datos quedaron en la ficha del profesional."
          : revisada
            ? "Guardado. Los datos quedaron en tu ficha pública."
            : "Guardado. Queda a la espera de revisión antes de aparecer en la búsqueda.",
      );
    } catch {
      setEstado("Falló el guardado. Recargá la página y probá otra vez.");
    } finally {
      setGuardando(false);
    }
  }

  function cambiar(parcial: Partial<typeof borrador>) {
    marcarCambio();
    setBorrador((actual) => ({ ...actual, ...parcial }));
  }

  function cambiarHorario(key: string, parcial: Partial<HorarioBorrador>) {
    marcarCambio();
    setBorrador((actual) => ({
      ...actual,
      horarios: actual.horarios.map((horario) => (horario.key === key ? { ...horario, ...parcial } : horario)),
    }));
  }

  function BarraGuardar({ alFinal = false }: { alFinal?: boolean }) {
    return (
      <div className={`flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-[#f8fafc] p-4 ${alFinal ? "mt-2" : ""}`}>
        <button type="button" className="boton" disabled={guardando} onClick={() => void guardarFicha()}>
          {guardando ? "Guardando…" : "Guardar ficha"}
        </button>
        <p
          className={`text-sm ${estado.includes("sin guardar") || estado.includes("Guardando") ? "text-warn" : guardadoOk && !hayCambios ? "text-menta" : "text-muted"}`}
        >
          {estado}
        </p>
        {guardadoOk && !hayCambios ? (
          <Link href={`/profesional/${professionalId}`} className="text-sm font-semibold text-link">
            Ver ficha pública
          </Link>
        ) : null}
      </div>
    );
  }

  const filas: FilaHorario[] = borrador.horarios
    .filter((horario) => horario.placeName.trim() || horario.placeId)
    .map((horario) => ({
      id: horario.id || horario.key,
      placeId: horario.placeId || horario.key,
      placeName: horario.placeName || "Lugar",
      locality: horario.locality,
      professionalDays: horario.days.join(","),
      professionalTime: horario.time,
      professionalShift: horario.shift,
      professionalScheduleNote: notaHorarioParaGuardar(
        horarioLugarParaGuardar(horario.schedule),
        horario.scheduleLegacy,
      ),
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
    photoUrl: borrador.photoUrl,
    price: borrador.price,
    priceUpdatedAt:
      borrador.price === inicial.price && inicial.priceUpdatedAt
        ? new Date(inicial.priceUpdatedAt)
        : borrador.price
          ? new Date()
          : null,
    whatsapp: borrador.whatsapp,
    phone: borrador.phone,
    obras: [...borrador.obras, borrador.otraObra].map((item) => item.trim()).filter(Boolean),
    updatedAt: new Date(),
    filas,
  });

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2">
      <form className="tarjeta grid gap-8" onSubmit={(event) => event.preventDefault()}>
        <BarraGuardar />
        {modoAdmin && ejemplo ? (
          <p className="rounded-2xl border border-warn/30 bg-paper px-4 py-3 text-base text-warn">
            Ficha de ejemplo. Los cambios se guardan y el cartel “Dato de ejemplo” sigue en la ficha pública.
          </p>
        ) : null}
        {!modoAdmin && !revisada ? (
          <p className="rounded-2xl border border-line bg-paper px-4 py-3 text-base">
            La primera vez revisamos nombre, matrícula y WhatsApp. Mientras tanto tu ficha no aparece en la búsqueda
            pública.
          </p>
        ) : !modoAdmin && !publicada ? (
          <p className="rounded-2xl border border-line bg-paper px-4 py-3 text-base">
            Tu ficha está bajada. Podés seguir editándola; Cercalud la vuelve a publicar cuando corresponda.
          </p>
        ) : null}
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold">Tus datos</h2>
          <FotoProfesionalEditor
            professionalId={professionalId}
            photoUrl={borrador.photoUrl}
            onChange={(photoUrl) => setBorrador((actual) => ({ ...actual, photoUrl }))}
          />
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
              {[
                "Clínica médica",
                "Pediatría",
                "Traumatología",
                "Ginecología",
                "Cardiología",
                "Oftalmología",
                "Psiquiatría",
                "Psicología",
                "Odontología",
                "Kinesiología",
                "Nutrición",
              ].map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
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
                          obras: event.target.checked
                            ? [...borrador.obras, obra]
                            : borrador.obras.filter((item) => item !== obra),
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
          <div className="grid gap-2">
            <h2 className="text-2xl font-semibold">Dónde atendés</h2>
            <p className="text-muted">
              Elegí un lugar que ya esté en Cercalud. Si no está, sugerilo: lo revisamos y lo publicamos nosotros. En
              cada lugar cargá el horario en el que atendés ahí.
            </p>
          </div>
          {borrador.horarios.map((horario) => (
            <div key={horario.key} className="grid gap-3 border-t border-line pt-4">
              {horario.placeId && !horario.sugerido ? (
                <p>
                  {horario.placeName} · {horario.locality}
                  {horario.publicado ? null : " · Pendiente de publicación"}
                </p>
              ) : (
                <label className="grid gap-1">
                  Lugar
                  <select
                    className="campo"
                    value={horario.sugerido ? "__sugerir" : horario.placeId || ""}
                    onChange={(event) => {
                      if (event.target.value === "__sugerir") {
                        cambiarHorario(horario.key, {
                          placeId: undefined,
                          sugerido: true,
                          publicado: false,
                          ownsPlace: false,
                          placeName: "",
                          address: "",
                          kind: "consultorio",
                        });
                        return;
                      }
                      const lugar = lugares.find((item) => item.id === event.target.value);
                      if (!lugar) return;
                      cambiarHorario(horario.key, {
                        placeId: lugar.id,
                        sugerido: false,
                        publicado: true,
                        ownsPlace: false,
                        placeName: lugar.name,
                        locality: lugar.locality,
                        kind: lugar.kind,
                        address: "",
                      });
                    }}
                  >
                    <option value="">Elegí un lugar</option>
                    <option value="__sugerir">El lugar no está · sugerirlo</option>
                    {lugares.map((lugar) => (
                      <option key={lugar.id} value={lugar.id}>
                        {lugar.name} · {lugar.locality}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {horario.sugerido ? (
                <>
                  <p className="text-sm text-muted">Sugerencia pendiente de revisión.</p>
                  <label className="grid gap-1">
                    Nombre del lugar
                    <input
                      className="campo"
                      value={horario.placeName}
                      onChange={(event) => cambiarHorario(horario.key, { placeName: event.target.value })}
                    />
                  </label>
                  <label className="grid gap-1">
                    Tipo
                    <select
                      className="campo"
                      value={horario.kind}
                      onChange={(event) => cambiarHorario(horario.key, { kind: event.target.value })}
                    >
                      {TIPOS_LUGAR.filter((tipo) => tipo.id !== "farmacia").map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1">
                    Localidad
                    <select
                      className="campo"
                      value={horario.locality}
                      onChange={(event) => cambiarHorario(horario.key, { locality: event.target.value })}
                    >
                      {LOCALIDADES.map((localidad) => (
                        <option key={localidad}>{localidad}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1">
                    Dirección
                    <input
                      className="campo"
                      value={horario.address}
                      onChange={(event) => cambiarHorario(horario.key, { address: event.target.value })}
                    />
                  </label>
                </>
              ) : null}
              {(horario.placeId || horario.sugerido) && horario.placeName.trim() ? (
                <HorarioLugarEditor
                  valor={horario.schedule}
                  legacy={horario.scheduleLegacy}
                  onChange={(schedule) => cambiarHorario(horario.key, { schedule })}
                />
              ) : null}
              <button
                type="button"
                className="w-fit font-semibold text-accent"
                onClick={() => cambiar({ horarios: borrador.horarios.filter((item) => item.key !== horario.key) })}
              >
                Quitar este lugar
              </button>
            </div>
          ))}
          <button
            type="button"
            className="boton-suave w-fit"
            onClick={() => cambiar({ horarios: [...borrador.horarios, horarioVacio()] })}
          >
            Agregar un lugar
          </button>
        </section>
        <BarraGuardar alFinal />
      </form>
      <aside className="grid gap-3 lg:sticky lg:top-24">
        <h2 className="text-2xl font-semibold">Así lo ve el paciente</h2>
        <FichaProfesional vista={vista} enlazar={false} />
      </aside>
    </div>
  );
}