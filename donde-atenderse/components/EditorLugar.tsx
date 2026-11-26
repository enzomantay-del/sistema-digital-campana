"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { GuardadoLugar } from "@/lib/guardarLugarCore";
import { FichaLugar } from "@/components/FichaLugar";
import { HorarioLugarEditor } from "@/components/HorarioLugarEditor";
import { LogoLugarEditor } from "@/components/LogoLugarEditor";
import { LOCALIDADES, OBRAS_INICIALES, TIPOS_LUGAR } from "@/lib/constants";
import type { BorradorLugar, EstudioBorrador } from "@/lib/draft";
import { SelectorObras } from "@/components/SelectorObras";
import { MODOS_OBRAS_LUGAR, obrasModoDefault } from "@/lib/placeObras";
import { SERVICIOS_LUGAR } from "@/lib/placeServices";
import type { ObrasModoLugar } from "@/lib/placeObras";
import { notaHorarioParaGuardar } from "@/lib/placeSchedule";
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
      const respuesta = await fetch(`/api/lugar/${placeId}/guardar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
        credentials: "same-origin",
      });
      const resultado = (await respuesta.json()) as GuardadoLugar;
      if (!resultado?.ok) {
        setEstado(resultado?.error ?? "No se pudo guardar. Probá de nuevo.");
        return;
      }
      const fusion = {
        ...ultimo.current,
        scheduleLegacy: null,
        studies: ultimo.current.studies.map((estudio) => {
          const guardado = resultado.studies.find((fila) => fila.key === estudio.key);
          return guardado ? { ...estudio, id: guardado.id } : estudio;
        }),
      };
      ultimo.current = fusion;
      setBorrador(fusion);
      setHayCambios(false);
      setGuardadoOk(true);
      setEstado("Guardado. Los datos quedaron en la ficha del lugar.");
    } catch {
      setEstado("Falló el guardado. Recargá la página y probá otra vez.");
    } finally {
      setGuardando(false);
    }
  }

  function cambiar(parcial: Partial<BorradorLugar>) {
    marcarCambio();
    setBorrador((actual) => ({ ...actual, ...parcial }));
  }

  function cambiarEstudio(key: string, parcial: Partial<EstudioBorrador>) {
    marcarCambio();
    setBorrador((actual) => ({
      ...actual,
      studies: actual.studies.map((estudio) => (estudio.key === key ? { ...estudio, ...parcial } : estudio)),
    }));
  }

  function BarraGuardar({ alFinal = false }: { alFinal?: boolean }) {
    return (
      <div className={`flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-[#f8fafc] p-4 ${alFinal ? "mt-2" : ""}`}>
        <button type="button" className="boton" disabled={guardando} onClick={() => void guardarFicha()}>
          {guardando ? "Guardando…" : "Guardar ficha"}
        </button>
        <p className={`text-sm ${estado.includes("sin guardar") || estado.includes("Guardando") ? "text-warn" : guardadoOk && !hayCambios ? "text-menta" : "text-muted"}`}>
          {estado}
        </p>
        {guardadoOk && !hayCambios && borrador.kind !== "farmacia" ? (
          <Link href={`/lugar/${placeId}`} className="text-sm font-semibold text-link">
            Ver ficha pública
          </Link>
        ) : null}
        {guardadoOk && !hayCambios && borrador.kind === "farmacia" ? (
          <Link href="/farmacia" className="text-sm font-semibold text-link">
            Ver farmacia de turno
          </Link>
        ) : null}
      </div>
    );
  }

  const vista = armarVistaLugar({
    placeId,
    name: borrador.name || "Sin nombre",
    kind: borrador.kind,
    locality: borrador.locality,
    address: borrador.address,
    logoUrl: borrador.logoUrl,
    whatsapp: borrador.whatsapp,
    phone: borrador.phone,
    scheduleNote: notaHorarioParaGuardar(borrador.schedule, borrador.scheduleLegacy),
    obrasMode: borrador.obrasMode,
    obras: [...borrador.obras, borrador.otraObra].map((item) => item.trim()).filter(Boolean).sort((a, b) => a.localeCompare(b, "es")),
    cantidadProfesionales: 0,
    especialidades: [],
    updatedAt: new Date(),
    servicios: borrador.servicios,
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
        <BarraGuardar />
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold">El lugar</h2>
          <LogoLugarEditor
            placeId={placeId}
            logoUrl={borrador.logoUrl}
            onChange={(logoUrl) => {
              setBorrador((actual) => ({ ...actual, logoUrl }));
            }}
          />
          <label className="grid gap-1">
            Nombre
            <input className="campo" value={borrador.name} onChange={(event) => cambiar({ name: event.target.value })} />
          </label>
          <label className="grid gap-1">
            Tipo
            <select
              className="campo"
              value={borrador.kind}
              onChange={(event) => {
                const kind = event.target.value;
                cambiar({ kind, obrasMode: obrasModoDefault(kind) });
              }}
            >
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
            <HorarioLugarEditor
              valor={borrador.schedule}
              legacy={borrador.scheduleLegacy}
              onChange={(schedule) => {
                marcarCambio();
                setBorrador((actual) => ({ ...actual, schedule }));
              }}
            />
          </fieldset>
          <fieldset className="grid gap-3">
            <legend className="font-semibold">Obras sociales</legend>
            <label className="grid gap-1">
              Cómo publicar las obras sociales
              <select
                className="campo"
                value={borrador.obrasMode}
                onChange={(event) => cambiar({ obrasMode: event.target.value as ObrasModoLugar })}
              >
                {MODOS_OBRAS_LUGAR.map((modo) => (
                  <option key={modo.id} value={modo.id}>
                    {modo.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm text-muted">{MODOS_OBRAS_LUGAR.find((item) => item.id === borrador.obrasMode)?.descripcion}</p>
            {borrador.obrasMode === "por_profesional" ? (
              <p className="text-sm text-muted">
                No hace falta marcar obras sociales acá. Cada profesional las carga en su ficha.
              </p>
            ) : (
              <SelectorObras
                catalogo={catalogo}
                seleccionadas={borrador.obras}
                otraObra={borrador.otraObra}
                titulo="Obras sociales que atiende el lugar"
                onSeleccionadas={(obras) => cambiar({ obras })}
                onOtraObra={(otraObra) => cambiar({ otraObra })}
              />
            )}
          </fieldset>
        </section>

        {borrador.kind !== "farmacia" ? (
          <section className="grid gap-3">
            <h2 className="text-2xl font-semibold">Servicios del lugar</h2>
            <p className="text-sm text-muted">
              Marcá lo que ofrece el centro: internación, cirugía, terapia intensiva, etc. Aparece en la ficha pública.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SERVICIOS_LUGAR.map((servicio) => {
                const activo = borrador.servicios.includes(servicio.id);
                return (
                  <label
                    key={servicio.id}
                    className={activo ? "pastilla pastilla-compacta pastilla-activa" : "pastilla pastilla-compacta"}
                  >
                    <input
                      className="sr-only"
                      type="checkbox"
                      checked={activo}
                      onChange={(event) =>
                        cambiar({
                          servicios: event.target.checked
                            ? [...borrador.servicios, servicio.id]
                            : borrador.servicios.filter((item) => item !== servicio.id),
                        })
                      }
                    />
                    {servicio.label}
                  </label>
                );
              })}
            </div>
          </section>
        ) : null}

        {borrador.kind === "farmacia" ? (
          <section className="grid gap-3 rounded-xl border border-line bg-paper px-4 py-3">
            <h2 className="text-xl font-semibold">Turno de farmacia</h2>
            <p className="text-sm text-muted">
              Los turnos no se cargan en esta ficha. Cercalud los importa desde el turnero oficial (día y hora exactos) en
              Administración.
            </p>
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
        <BarraGuardar alFinal />
      </form>
      <aside className="grid gap-3 lg:sticky lg:top-24">
        <h2 className="text-2xl font-semibold">Así lo ve el paciente</h2>
        <FichaLugar vista={vista} enlazar={false} mostrarProfesionalesEnFicha={borrador.kind !== "farmacia"} />
        {borrador.kind === "farmacia" ? (
          <p className="text-sm text-muted">
            El turno de farmacia se publica en <strong>Farmacia de turno</strong> cuando corresponda según el turnero
            (no desde esta ficha).
          </p>
        ) : null}
      </aside>
    </div>
  );
}