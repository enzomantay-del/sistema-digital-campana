"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ESPECIALIDADES_CATALOGO } from "@/lib/especialidades";
import { FichaProfesional } from "@/components/FichaProfesional";
import { AvisoMatriculaEditor } from "@/components/AvisoMatriculaEditor";
import { FotoProfesionalEditor } from "@/components/FotoProfesionalEditor";
import { SugerirLugarProfesional } from "@/components/SugerirLugarProfesional";
import { HorarioLugarEditor } from "@/components/HorarioLugarEditor";
import { SelectorObras } from "@/components/SelectorObras";
import { AREAS, OBRAS_INICIALES } from "@/lib/constants";
import { campoDesdeEspecialidades } from "@/lib/especialidades";
import type { BorradorProfesional, HorarioBorrador } from "@/lib/draft";
import { horarioLugarParaGuardar, horarioLugarVacio, notaHorarioParaGuardar } from "@/lib/placeSchedule";
import { armarVistaProfesional } from "@/lib/view";
import { AvisoCampo, claseCampoConError } from "@/components/AvisoCampo";
import { erroresCamposFichaProfesional, idPrimerCampoConError } from "@/lib/erroresCamposFicha";
import { mensajeSolapamientoEntreSedes } from "@/lib/solapamientoHorarios";
import { validarAntesDeGuardar } from "@/lib/validarProfesional";
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
    obras: [],
    otraObra: "",
  };
}

export function EditorProfesional({
  inicial,
  lugares,
  obras,
  revisada,
  publicada,
  modoAdmin = false,
  modoSecretaria = false,
  placeIdEnfoque,
  volverHref,
  professionalId,
  ejemplo = false,
}: {
  inicial: BorradorProfesional & { priceUpdatedAt: string | null };
  lugares: {
    id: string;
    name: string;
    locality: string;
    kind: string;
    published?: boolean;
    whatsapp?: string;
    phone?: string;
  }[];
  obras: string[];
  revisada: boolean;
  publicada: boolean;
  modoAdmin?: boolean;
  modoSecretaria?: boolean;
  placeIdEnfoque?: string;
  volverHref?: string;
  professionalId: string;
  ejemplo?: boolean;
}) {
  const claveBorradorLocal = `cercalud-borrador-${professionalId}`;
  const [borrador, setBorrador] = useState(inicial);
  const [lugaresLista, setLugaresLista] = useState(lugares);
  const [hayCambios, setHayCambios] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [estado, setEstado] = useState("Cuando termines, tocá Guardar ficha para que quede en la ficha pública.");
  const [avisoRojo, setAvisoRojo] = useState<string | null>(null);
  const [marcarCamposEnRojo, setMarcarCamposEnRojo] = useState(false);
  const ultimo = useRef(borrador);
  ultimo.current = borrador;
  const modoPropio = !modoAdmin && !modoSecretaria;
  const catalogo = Array.from(new Set([...OBRAS_INICIALES, ...obras])).sort((a, b) => a.localeCompare(b, "es"));
  const avisoSolapamiento = useMemo(
    () => mensajeSolapamientoEntreSedes(borrador.horarios.filter((h) => h.placeId)),
    [borrador.horarios],
  );
  const erroresCampos = useMemo(
  () =>
      erroresCamposFichaProfesional(borrador, {
        exigeHorario: true,
        tieneFoto: Boolean(borrador.photoUrl?.trim()),
      }),
    [borrador],
  );
  const erroresVisibles = marcarCamposEnRojo ? erroresCampos : null;

  function avisoCampo(mensaje?: string) {
    return erroresVisibles ? mensaje : null;
  }

  function enfocarPrimerError(errores = erroresCampos) {
    const id = idPrimerCampoConError(errores);
    if (!id) return;
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  useEffect(() => {
    setLugaresLista(lugares);
  }, [lugares]);

  useEffect(() => {
    if (!modoPropio) return;
    try {
      const crudo = sessionStorage.getItem(claveBorradorLocal);
      if (!crudo) return;
      const guardado = JSON.parse(crudo) as { borrador: typeof inicial; dirty?: boolean };
      if (guardado.dirty && guardado.borrador) {
        setBorrador(guardado.borrador);
        setHayCambios(true);
        setEstado("Recuperamos datos que todavía no habías guardado en el servidor.");
      }
    } catch {
      /* ignorar */
    }
    // Solo al montar: recuperar borrador local si hubo recarga accidental.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveBorradorLocal, modoPropio]);

  useEffect(() => {
    if (!modoPropio) return;
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(claveBorradorLocal, JSON.stringify({ borrador, dirty: hayCambios }));
      } catch {
        /* ignorar */
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [borrador, claveBorradorLocal, hayCambios, modoPropio]);

  function agregarLugarSugerido(lugar: { id: string; name: string; locality: string; kind: string }) {
    setLugaresLista((lista) => {
      if (lista.some((item) => item.id === lugar.id)) return lista;
      return [...lista, { ...lugar, published: false, whatsapp: "", phone: "" }];
    });
    marcarCambio();
    const datosSede = {
      placeId: lugar.id,
      placeName: lugar.name,
      locality: lugar.locality,
      kind: lugar.kind,
      sugerido: true,
      publicado: false,
    };
    setBorrador((actual) => {
      const sinSede = actual.horarios.find((horario) => !horario.placeId);
      if (sinSede) {
        return {
          ...actual,
          horarios: actual.horarios.map((horario) =>
            horario.key === sinSede.key ? { ...horario, ...datosSede } : horario,
          ),
        };
      }
      return {
        ...actual,
        horarios: [...actual.horarios, { ...horarioVacio(), ...datosSede }],
      };
    });
  }

  function marcarCambio() {
    setHayCambios(true);
    setGuardadoOk(false);
    setAvisoRojo(null);
    setEstado("Tenés cambios sin guardar.");
  }

  async function guardarFicha() {
    if (guardando) return;
    const snapshot = ultimo.current;
    const tieneFoto = Boolean(snapshot.photoUrl?.trim());
    const errorLocal = validarAntesDeGuardar(snapshot, { exigeHorario: true, tieneFoto });
    if (errorLocal) {
      setMarcarCamposEnRojo(true);
      setAvisoRojo(errorLocal);
      setEstado("Revisá lo marcado en rojo antes de guardar.");
      enfocarPrimerError();
      return;
    }
    setAvisoRojo(null);
    setMarcarCamposEnRojo(false);
    setGuardando(true);
    setEstado("Guardando…");
    try {
      const respuesta = await fetch(`/api/profesional/${professionalId}/ficha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          borrador: snapshot,
          modo: modoSecretaria ? "secretaria" : modoAdmin ? "admin" : undefined,
        }),
      });
      const resultado = (await respuesta.json()) as
        | { ok: true; rows: { key: string; id: string; placeId: string }[]; professionalId: string }
        | { ok: false; error: string };
      if (!resultado.ok) {
        const mensaje = resultado.error ?? "No se pudo guardar. Probá de nuevo.";
        setMarcarCamposEnRojo(true);
        setAvisoRojo(mensaje);
        setEstado("Revisá lo marcado en rojo antes de guardar.");
        enfocarPrimerError();
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
      setAvisoRojo(null);
      setMarcarCamposEnRojo(false);
      try {
        sessionStorage.removeItem(claveBorradorLocal);
      } catch {
        /* ignorar */
      }
      setEstado(
        modoSecretaria
          ? "Guardado. La administración revisa antes de publicar en la web."
          : modoAdmin
            ? "Guardado. Los datos quedaron en la ficha del profesional."
            : revisada
              ? "Guardado. Los datos quedaron en tu ficha pública."
              : "Guardado. Queda a la espera de revisión antes de aparecer en la búsqueda.",
      );
      if (modoSecretaria && volverHref) window.location.assign(volverHref);
    } catch {
      setEstado("No llegó respuesta del servidor. Revisá la conexión, recargá la página y probá otra vez.");
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
      <div
        className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 ${avisoRojo ? "border-warn bg-[#fff5f5]" : "border-line bg-[#f8fafc]"} ${alFinal ? "mt-2" : ""}`}
      >
        <button type="button" className="boton" disabled={guardando} onClick={() => void guardarFicha()}>
          {guardando ? "Guardando…" : "Guardar ficha"}
        </button>
        <p
          className={`text-sm ${avisoRojo ? "hidden" : estado.includes("sin guardar") || estado.includes("Guardando") ? "text-warn" : guardadoOk && !hayCambios ? "text-menta" : "text-muted"}`}
        >
          {estado}
        </p>
        {avisoRojo ? (
          <p className="w-full text-sm font-semibold leading-snug text-warn" role="alert">
            {avisoRojo}
          </p>
        ) : null}
        {guardadoOk && !hayCambios && !modoSecretaria && publicada ? (
          <Link href={`/profesional/${professionalId}`} className="text-sm font-semibold text-link">
            Ver ficha pública
          </Link>
        ) : null}
        {volverHref && !modoSecretaria ? (
          <Link href={volverHref} className="text-sm font-semibold text-link">
            Volver
          </Link>
        ) : null}
      </div>
    );
  }

  const filas: FilaHorario[] = borrador.horarios
    .filter((horario) => horario.placeName.trim() || horario.placeId)
    .map((horario) => {
      const lugar = horario.placeId ? lugaresLista.find((item) => item.id === horario.placeId) : null;
      return {
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
        placeWhatsapp: lugar?.whatsapp?.trim() ?? "",
        placePhone: lugar?.phone?.trim() ?? "",
        obrasEnLugar: [...(horario.obras ?? []), horario.otraObra?.trim() ?? ""].filter(Boolean),
      };
    });

  const vista = armarVistaProfesional({
    fullName: borrador.fullName,
    specialty: borrador.specialty,
    specialties: campoDesdeEspecialidades(borrador.specialties ?? []),
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
    agendaWhatsapp: borrador.agendaWhatsapp,
    agendaPhone: borrador.agendaPhone,
    obras: borrador.horarios.flatMap((h) => [...(h.obras ?? []), h.otraObra].filter(Boolean)),
    updatedAt: new Date(),
    filas,
  });

  return (
    <div
      className={
        modoPropio ? "panel-profesional-editor grid items-start gap-10 lg:grid-cols-2" : "grid items-start gap-10 lg:grid-cols-2"
      }
    >
      <div className={modoPropio ? "tarjeta grid gap-8 border-menta/20 shadow-md" : "tarjeta grid gap-8"}>
        <BarraGuardar />
        {modoAdmin && ejemplo ? (
          <p className="rounded-2xl border border-warn/30 bg-paper px-4 py-3 text-base text-warn">
            Ficha de ejemplo. Los cambios se guardan y el cartel “Dato de ejemplo” sigue en la ficha pública.
          </p>
        ) : null}
        {!modoAdmin && !revisada ? (
          <p className="rounded-2xl border border-line bg-paper px-4 py-3 text-base">
            La primera vez revisamos nombre, matrícula y foto. Mientras tanto tu ficha no aparece en la búsqueda pública.
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
            placeIdEnfoque={placeIdEnfoque}
            avisoCampo={avisoCampo(erroresVisibles?.photo)}
            onChange={(photoUrl) => {
              marcarCambio();
              setBorrador((actual) => ({ ...actual, photoUrl }));
            }}
          />
          <label className="grid gap-1" id="campo-error-nombre">
            Nombre
            <input
              className={claseCampoConError(avisoCampo(erroresVisibles?.fullName))}
              value={borrador.fullName}
              onChange={(event) => cambiar({ fullName: event.target.value })}
            />
            <AvisoCampo mensaje={avisoCampo(erroresVisibles?.fullName)} />
          </label>
          <label className="grid gap-1" id="campo-error-matricula">
            Matrícula
            <input
              className={claseCampoConError(avisoCampo(erroresVisibles?.license))}
              value={borrador.license}
              onChange={(event) => cambiar({ license: event.target.value })}
            />
            <AvisoCampo mensaje={avisoCampo(erroresVisibles?.license)} />
          </label>
          {modoPropio ? <AvisoMatriculaEditor matricula={borrador.license} professionalId={professionalId} /> : null}
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
          <fieldset
            className={`grid gap-2 ${avisoCampo(erroresVisibles?.specialties) ? "rounded-2xl border border-warn bg-[#fff8f8] p-3" : ""}`}
            id="campo-error-especialidades"
          >
            <legend className="font-semibold">Especialidades</legend>
            <p className="text-sm text-muted">Podés marcar más de una.</p>
            <div className="flex flex-wrap gap-2">
              {ESPECIALIDADES_CATALOGO.map((item) => {
                const lista = borrador.specialties ?? [];
                const activa = lista.includes(item);
                return (
                  <label key={item} className={activa ? "pastilla pastilla-activa" : "pastilla"}>
                    <input
                      className="sr-only"
                      type="checkbox"
                      checked={activa}
                      onChange={(event) =>
                        cambiar({
                          specialties: event.target.checked
                            ? [...lista, item]
                            : lista.filter((esp) => esp !== item),
                          specialty: event.target.checked ? item : lista.filter((esp) => esp !== item)[0] ?? "",
                        })
                      }
                    />
                    {item}
                  </label>
                );
              })}
            </div>
            <AvisoCampo mensaje={avisoCampo(erroresVisibles?.specialties)} />
          </fieldset>
          <fieldset className="grid gap-3 rounded-2xl border border-line bg-[#f8fafc] p-4">
            <legend className="font-semibold">Secretaría / agenda del profesional (opcional)</legend>
            <p className="text-sm text-muted">
              Si el médico tiene secretaría propia para todos sus lugares, cargala acá. Para turnos en cada centro usá el
              contacto del lugar (abajo en cada sede).
            </p>
            <label className="grid gap-1">
              WhatsApp de agenda
              <input
                className="campo"
                value={borrador.agendaWhatsapp}
                onChange={(event) => cambiar({ agendaWhatsapp: event.target.value })}
              />
            </label>
            <label className="grid gap-1">
              Teléfono de agenda
              <input
                className="campo"
                value={borrador.agendaPhone}
                onChange={(event) => cambiar({ agendaPhone: event.target.value })}
              />
            </label>
          </fieldset>
          <label className="grid gap-1">
            Precio de la consulta (opcional, sobre todo si atiende particular)
            <input className="campo" value={borrador.price} onChange={(event) => cambiar({ price: event.target.value })} />
          </label>
        </section>

        <section className="grid gap-5">
          <div className="grid gap-2">
            <h2 className="text-2xl font-semibold">Dónde atendés</h2>
            <p className="text-muted">
              {modoSecretaria
                ? "Cargá el horario de este profesional en el centro asignado (hospital, consultorio, sanatorio, etc.)."
                : "Indicá cada centro donde atendés: elegí uno que ya figure en Cercalud o agregá una sede nueva."}
            </p>
          </div>
          {avisoSolapamiento ? (
            <p
              id="campo-error-solapamiento"
              className="rounded-2xl border border-warn bg-[#fff8f0] px-4 py-3 text-sm font-semibold leading-snug text-warn"
              role="alert"
            >
              {avisoSolapamiento}
            </p>
          ) : null}
          {avisoCampo(erroresVisibles?.solapamiento) && !avisoSolapamiento ? (
            <p
              id="campo-error-solapamiento"
              className="rounded-2xl border border-warn bg-[#fff8f0] px-4 py-3 text-sm font-semibold leading-snug text-warn"
              role="alert"
            >
              {erroresVisibles?.solapamiento}
            </p>
          ) : null}
          {borrador.horarios.map((horario, indiceHorario) => {
            const variasSedes = borrador.horarios.length > 1;
            const errH = erroresVisibles?.porHorario[horario.key];
            const bloqueHorario = horario.placeId && horario.placeName.trim() ? (
              <>
                <HorarioLugarEditor
                  valor={horario.schedule}
                  legacy={horario.scheduleLegacy}
                  aviso={avisoCampo(errH?.horario)}
                  onChange={(schedule) => cambiarHorario(horario.key, { schedule })}
                />
                <SelectorObras
                  catalogo={catalogo}
                  seleccionadas={horario.obras ?? []}
                  otraObra={horario.otraObra ?? ""}
                  titulo={`Obras sociales en ${horario.placeName || "esta sede"}`}
                  avisoCampo={avisoCampo(errH?.obras)}
                  onSeleccionadas={(obras) => cambiarHorario(horario.key, { obras })}
                  onOtraObra={(otraObra) => cambiarHorario(horario.key, { otraObra })}
                />
              </>
            ) : null;

            return (
            <div
              key={horario.key}
              id={errH?.lugar ? `campo-error-lugar-${horario.key}` : errH?.horario ? `campo-error-horario-${horario.key}` : errH?.obras ? `campo-error-obras-${horario.key}` : undefined}
              className={`grid gap-3 border-t pt-4 ${errH ? "border-warn bg-[#fffaf8]" : "border-line"}`}
            >
              {horario.placeId && (modoSecretaria || placeIdEnfoque) ? (
                <p>
                  {horario.placeName} · {horario.locality}
                  {!horario.publicado ? " · Centro en revisión" : null}
                </p>
              ) : horario.placeId && modoPropio ? (
                <p>
                  <span className="font-semibold">{horario.placeName}</span> · {horario.locality}
                  {!horario.publicado ? (
                    <span className="text-menta"> · Tu sugerencia en revisión</span>
                  ) : null}
                </p>
              ) : (
                <label className="grid gap-1">
                  Centro donde atendés
                  <select
                    className={claseCampoConError(avisoCampo(errH?.lugar))}
                    value={horario.placeId || ""}
                    disabled={modoSecretaria || Boolean(placeIdEnfoque)}
                    onChange={(event) => {
                      const lugar = lugaresLista.find((item) => item.id === event.target.value);
                      if (!lugar) return;
                      const publicado = lugar.published !== false;
                      cambiarHorario(horario.key, {
                        placeId: lugar.id,
                        sugerido: !publicado,
                        publicado,
                        ownsPlace: false,
                        placeName: lugar.name,
                        locality: lugar.locality,
                        kind: lugar.kind,
                        address: "",
                      });
                    }}
                  >
                    <option value="">Elegí hospital, consultorio u otro centro…</option>
                    {lugaresLista
                      .filter((lugar) => !placeIdEnfoque || lugar.id === placeIdEnfoque)
                      .map((lugar) => (
                      <option key={lugar.id} value={lugar.id}>
                        {lugar.name} · {lugar.locality}
                        {lugar.published === false ? " (en revisión)" : ""}
                      </option>
                    ))}
                  </select>
                  <AvisoCampo mensaje={avisoCampo(errH?.lugar)} />
                </label>
              )}
              {bloqueHorario ? (
                variasSedes ? (
                  <details className="grid gap-2 rounded-xl border border-line px-3 py-2" open={indiceHorario === 0}>
                    <summary className="cursor-pointer text-sm font-semibold">Horario y obras sociales</summary>
                    {bloqueHorario}
                  </details>
                ) : (
                  bloqueHorario
                )
              ) : null}
              {!modoSecretaria ? (
                <button
                  type="button"
                  className="w-fit font-semibold text-accent"
                  onClick={() => cambiar({ horarios: borrador.horarios.filter((item) => item.key !== horario.key) })}
                >
                  Quitar esta sede
                </button>
              ) : null}
            </div>
          );
          })}
          {!modoSecretaria ? (
            <div
              className={`grid gap-3 border-t pt-4 ${avisoCampo(erroresVisibles?.sedes) ? "rounded-2xl border-warn bg-[#fff8f8] p-3" : "border-line"}`}
              id="campo-error-sedes"
            >
              <AvisoCampo mensaje={avisoCampo(erroresVisibles?.sedes)} />
              <button
                type="button"
                className="boton w-fit"
                onClick={() => cambiar({ horarios: [...borrador.horarios, horarioVacio()] })}
              >
                Agregar una sede
              </button>
              <p className="text-xs text-muted">
                Buscá el nombre en el desplegable de cada sede. Son hospitales, sanatorios, consultorios y
                policonsultorios del corredor.
              </p>
            </div>
          ) : null}
        </section>
        {!modoSecretaria ? (
          <div className="grid gap-2 rounded-2xl border border-dashed border-line bg-[#f8fafc] px-4 py-3">
            <p className="text-xs text-muted">
              Si el centro no está en el desplegable, sugerilo acá. Después tocá «Guardar ficha» para enviar todo a
              Cercalud y que aparezca en administración.
            </p>
            <SugerirLugarProfesional onSugerido={agregarLugarSugerido} />
          </div>
        ) : null}
        <BarraGuardar alFinal />
      </div>
      <aside className={`grid gap-3 lg:sticky lg:top-24 ${modoPropio ? "rounded-3xl border border-line bg-white/90 p-4 shadow-sm" : ""}`}>
        <h2 className="text-2xl font-semibold">{modoPropio ? "Vista previa para pacientes" : "Así lo ve el paciente"}</h2>
        <FichaProfesional vista={vista} enlazar={false} />
      </aside>
    </div>
  );
}