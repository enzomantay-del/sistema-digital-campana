"use client";

import { DIAS } from "@/lib/constants";
import type {
  FranjaHorarioLugar,
  HorarioLugarData,
  IdTurnoHorarioLugar,
  OrdinalMensual,
  PeriodicidadFranja,
} from "@/lib/placeSchedule";
import {
  ORDINALES_MENSUALES,
  TURNOS_HORARIO_LUGAR,
  diasEnConflicto,
  diasSinFranja,
  esPeriodicidadSemanal,
  etiquetasDias,
  franjaHorarioVacia,
  grupoHorarioVacio,
  normalizarHora,
  periodicidadDefecto,
} from "@/lib/placeSchedule";

type ModoPeriodicidad = PeriodicidadFranja["tipo"];

const OPCIONES_MODO: { id: ModoPeriodicidad; label: string; ayuda: string }[] = [
  { id: "semanal", label: "Cada semana", ayuda: "Mismos días todas las semanas (ej. solo miércoles)." },
  {
    id: "mensual_dia",
    label: "Un día fijo del mes",
    ayuda: "Ej. el 10 de cada mes.",
  },
  {
    id: "mensual_semana",
    label: "Día del mes en la semana",
    ayuda: "Ej. primer miércoles de cada mes.",
  },
  { id: "fechas", label: "Fechas puntuales", ayuda: "Cuando viene solo en días concretos." },
  { id: "nota", label: "Horario especial (texto)", ayuda: "Si no entra en las opciones anteriores." },
];

function modoPeriodicidad(p: PeriodicidadFranja | undefined): ModoPeriodicidad {
  return p?.tipo ?? "semanal";
}

function PeriodicidadEditor({
  franja,
  onChange,
}: {
  franja: FranjaHorarioLugar;
  onChange: (franja: FranjaHorarioLugar) => void;
}) {
  const actual = franja.periodicidad ?? periodicidadDefecto();
  const modo = modoPeriodicidad(actual);

  function cambiarModo(tipo: ModoPeriodicidad) {
    let periodicidad: PeriodicidadFranja;
    if (tipo === "semanal") periodicidad = { tipo: "semanal", cadaSemanas: 1 };
    else if (tipo === "mensual_dia") periodicidad = { tipo: "mensual_dia", diaDelMes: 1 };
    else if (tipo === "mensual_semana") periodicidad = { tipo: "mensual_semana", ordinal: "primero", dia: "mie" };
    else if (tipo === "fechas") periodicidad = { tipo: "fechas", fechas: [""] };
    else periodicidad = { tipo: "nota", texto: "" };
    onChange({ ...franja, periodicidad, dias: tipo === "semanal" ? franja.dias : [] });
  }

  function cambiarPeriodicidad(periodicidad: PeriodicidadFranja) {
    onChange({ ...franja, periodicidad });
  }

  const ayuda = OPCIONES_MODO.find((item) => item.id === modo)?.ayuda;

  return (
    <div className="grid gap-2 rounded-xl border border-dashed border-line/80 bg-surface/40 p-3">
      <p className="text-sm font-medium">¿Cuándo atiende esta franja?</p>
      <div className="flex flex-wrap gap-2">
        {OPCIONES_MODO.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            className={modo === opcion.id ? "pastilla pastilla-compacta pastilla-activa" : "pastilla pastilla-compacta"}
            onClick={() => cambiarModo(opcion.id)}
          >
            {opcion.label}
          </button>
        ))}
      </div>
      {ayuda ? <p className="text-xs text-muted">{ayuda}</p> : null}

      {modo === "semanal" && actual.tipo === "semanal" ? (
        <label className="grid gap-1 text-sm text-muted">
          Repetición
          <select
            className="campo text-sm"
            value={String(actual.cadaSemanas ?? 1)}
            onChange={(event) => {
              const valor = Number(event.target.value);
              cambiarPeriodicidad(
                valor > 1 ? { tipo: "semanal", cadaSemanas: valor } : { tipo: "semanal", cadaSemanas: 1 },
              );
            }}
          >
            <option value="1">Todas las semanas</option>
            <option value="2">Cada 2 semanas</option>
            <option value="3">Cada 3 semanas</option>
            <option value="4">Cada 4 semanas</option>
          </select>
        </label>
      ) : null}

      {modo === "mensual_dia" && actual.tipo === "mensual_dia" ? (
        <label className="grid gap-1 text-sm text-muted">
          Día del mes (1 a 31)
          <input
            className="campo w-28 text-sm"
            type="number"
            min={1}
            max={31}
            value={actual.diaDelMes}
            onChange={(event) =>
              cambiarPeriodicidad({ tipo: "mensual_dia", diaDelMes: Number(event.target.value) || 1 })
            }
          />
        </label>
      ) : null}

      {modo === "mensual_semana" && actual.tipo === "mensual_semana" ? (
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm text-muted">
            Cuál del mes
            <select
              className="campo text-sm"
              value={actual.ordinal}
              onChange={(event) =>
                cambiarPeriodicidad({
                  ...actual,
                  ordinal: event.target.value as OrdinalMensual,
                })
              }
            >
              {ORDINALES_MENSUALES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Día
            <select
              className="campo text-sm"
              value={actual.dia}
              onChange={(event) => cambiarPeriodicidad({ ...actual, dia: event.target.value })}
            >
              {DIAS.map((dia) => (
                <option key={dia.id} value={dia.id}>
                  {dia.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {modo === "fechas" && actual.tipo === "fechas" ? (
        <div className="grid gap-2">
          {actual.fechas.map((fecha, indice) => (
            <div key={`${franja.key}-fecha-${indice}`} className="flex flex-wrap items-center gap-2">
              <input
                className="campo text-sm"
                type="date"
                value={fecha}
                onChange={(event) => {
                  const fechas = [...actual.fechas];
                  fechas[indice] = event.target.value;
                  cambiarPeriodicidad({ tipo: "fechas", fechas });
                }}
              />
              {actual.fechas.length > 1 ? (
                <button
                  type="button"
                  className="text-sm font-semibold text-accent"
                  onClick={() => {
                    const fechas = actual.fechas.filter((_, i) => i !== indice);
                    cambiarPeriodicidad({ tipo: "fechas", fechas: fechas.length ? fechas : [""] });
                  }}
                >
                  Quitar
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="w-fit text-sm font-semibold text-link"
            onClick={() => cambiarPeriodicidad({ tipo: "fechas", fechas: [...actual.fechas, ""] })}
          >
            Agregar otra fecha
          </button>
        </div>
      ) : null}

      {modo === "nota" && actual.tipo === "nota" ? (
        <label className="grid gap-1 text-sm text-muted">
          Descripción del horario
          <textarea
            className="campo min-h-[4.5rem] text-sm"
            placeholder="Ej. una vez al mes, coordinar por WhatsApp; o consultar en guardia."
            value={actual.texto}
            onChange={(event) => cambiarPeriodicidad({ tipo: "nota", texto: event.target.value })}
          />
        </label>
      ) : null}
    </div>
  );
}

function TurnosEditor({
  franja,
  onChange,
}: {
  franja: FranjaHorarioLugar;
  onChange: (franja: FranjaHorarioLugar) => void;
}) {
  function cambiarTurno(id: IdTurnoHorarioLugar, parcial: Partial<FranjaHorarioLugar[IdTurnoHorarioLugar]>) {
    onChange({ ...franja, [id]: { ...franja[id], ...parcial } });
  }

  if (franja.cerrado) {
    return <p className="text-sm text-muted">Este bloque marca esos días como cerrados (sin atención).</p>;
  }

  return (
    <>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={franja.guardia24}
          onChange={(event) => onChange({ ...franja, guardia24: event.target.checked })}
        />
        Guardia las 24 h
      </label>
      {TURNOS_HORARIO_LUGAR.map((turno) => {
        const datos = franja[turno.id];
        return (
          <div key={turno.id} className="grid gap-2 border-t border-line pt-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={datos.activo}
                onChange={(event) => cambiarTurno(turno.id, { activo: event.target.checked })}
              />
              {turno.label}
            </label>
            {datos.activo ? (
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm text-muted">
                  Desde
                  <input
                    className="campo text-sm"
                    placeholder="08:00"
                    value={datos.desde}
                    onChange={(event) => cambiarTurno(turno.id, { desde: event.target.value })}
                    onBlur={(event) => cambiarTurno(turno.id, { desde: normalizarHora(event.target.value) })}
                  />
                </label>
                <label className="grid gap-1 text-sm text-muted">
                  Hasta
                  <input
                    className="campo text-sm"
                    placeholder="12:00"
                    value={datos.hasta}
                    onChange={(event) => cambiarTurno(turno.id, { hasta: event.target.value })}
                    onBlur={(event) => cambiarTurno(turno.id, { hasta: normalizarHora(event.target.value) })}
                  />
                </label>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function FranjaEditor({
  indice,
  franja,
  diasOcupados,
  onChange,
  onQuitar,
  puedeQuitar,
}: {
  indice: number;
  franja: FranjaHorarioLugar;
  diasOcupados: Set<string>;
  onChange: (franja: FranjaHorarioLugar) => void;
  onQuitar: () => void;
  puedeQuitar: boolean;
}) {
  function alternarDia(diaId: string, activo: boolean) {
    onChange({
      ...franja,
      dias: activo ? [...franja.dias, diaId] : franja.dias.filter((item) => item !== diaId),
    });
  }

  function aplicarDias(dias: string[]) {
    onChange({ ...franja, dias });
  }

  const semanal = esPeriodicidadSemanal(franja.periodicidad);

  return (
    <fieldset className="grid gap-3 rounded-2xl border border-line p-4">
      <legend className="px-1 text-sm font-semibold">Franja {indice + 1}</legend>
      <PeriodicidadEditor franja={franja} onChange={onChange} />
      {semanal ? (
        <p className="text-xs text-muted">Elegí en qué días de la semana aplica. Podés sumar más franjas si un día es distinto.</p>
      ) : null}
      {semanal ? (
      <>
      <div className="flex flex-wrap gap-2">
        {DIAS.map((dia) => {
          const activo = franja.dias.includes(dia.id);
          const tomado = !activo && diasOcupados.has(dia.id);
          return (
            <label
              key={dia.id}
              className={
                activo
                  ? "pastilla pastilla-compacta pastilla-activa"
                  : tomado
                    ? "pastilla pastilla-compacta opacity-40"
                    : "pastilla pastilla-compacta"
              }
              title={tomado ? "Ese día ya está en otra franja" : undefined}
            >
              <input
                className="sr-only"
                type="checkbox"
                checked={activo}
                disabled={tomado}
                onChange={(event) => alternarDia(dia.id, event.target.checked)}
              />
              {dia.label}
            </label>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <button type="button" className="font-semibold text-link" onClick={() => aplicarDias(["lun", "mar", "mie", "jue", "vie"])}>
          Lun–vie
        </button>
        <button type="button" className="font-semibold text-link" onClick={() => aplicarDias(["sab"])}>
          Solo sábado
        </button>
        <button type="button" className="font-semibold text-link" onClick={() => aplicarDias(["dom"])}>
          Solo domingo
        </button>
      </div>
      </>
      ) : null}
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={franja.cerrado}
          onChange={(event) =>
            onChange(
              event.target.checked
                ? { ...franja, ...grupoHorarioVacio(), cerrado: true }
                : { ...franja, cerrado: false },
            )
          }
        />
        Cerrado (sin atención estos días)
      </label>
      {modoPeriodicidad(franja.periodicidad) !== "nota" ? (
        <TurnosEditor franja={franja} onChange={onChange} />
      ) : (
        <>
          <p className="text-xs text-muted">Si además querés sumar turnos concretos, activalos abajo (opcional).</p>
          <TurnosEditor franja={franja} onChange={onChange} />
        </>
      )}
      {puedeQuitar ? (
        <button type="button" className="w-fit text-sm font-semibold text-accent" onClick={onQuitar}>
          Quitar esta franja
        </button>
      ) : null}
    </fieldset>
  );
}

export function HorarioLugarEditor({
  valor,
  legacy,
  onChange,
  aviso,
}: {
  valor: HorarioLugarData;
  legacy: string | null;
  onChange: (valor: HorarioLugarData) => void;
  aviso?: string | null;
}) {
  const conflictos = diasEnConflicto(valor);
  const sinCubrir = diasSinFranja(valor);
  const ocupadosPorFranja = (excluirKey: string) => {
    const set = new Set<string>();
    for (const franja of valor.franjas) {
      if (franja.key === excluirKey) continue;
      if (!esPeriodicidadSemanal(franja.periodicidad)) continue;
      for (const dia of franja.dias) set.add(dia);
    }
    return set;
  };

  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted">
        Armá <strong>una franja por cada patrón</strong> (semana, mes, fechas sueltas o texto). Ejemplo: solo miércoles; primer viernes
        de cada mes; 12/05/2026; o “una vez al mes, coordinar por WhatsApp”. Sumá franjas distintas si el horario cambia.
      </p>
      {valor.franjas.map((franja, indice) => (
        <FranjaEditor
          key={franja.key}
          indice={indice}
          franja={franja}
          diasOcupados={ocupadosPorFranja(franja.key)}
          puedeQuitar={valor.franjas.length > 1}
          onChange={(actualizada) =>
            onChange({
              ...valor,
              franjas: valor.franjas.map((item) => (item.key === franja.key ? actualizada : item)),
            })
          }
          onQuitar={() => onChange({ ...valor, franjas: valor.franjas.filter((item) => item.key !== franja.key) })}
        />
      ))}
      <button
        type="button"
        className="boton-suave w-fit text-sm"
        onClick={() => onChange({ ...valor, franjas: [...valor.franjas, franjaHorarioVacia([])] })}
      >
        Agregar otra franja horaria
      </button>
      {conflictos.length ? (
        <p className="text-sm text-warn">Días en más de una franja: {etiquetasDias(conflictos)}.</p>
      ) : null}
      {aviso ? <p className="text-sm text-warn">{aviso}</p> : null}
      {sinCubrir.length ? (
        <p className="text-xs text-muted">Sin franja (no se publica horario): {etiquetasDias(sinCubrir)}.</p>
      ) : null}
      <label className="grid gap-1 text-sm text-muted">
        Complemento del horario (opcional, se publica al final)
        <textarea
          className="campo min-h-[3.5rem] text-sm"
          placeholder="Ej. feriados sin atención; confirmar antes de ir si es por guardia."
          value={valor.complemento ?? ""}
          onChange={(event) => onChange({ ...valor, complemento: event.target.value })}
        />
      </label>
      {legacy ? <p className="text-sm text-muted">Horario anterior (solo lectura): {legacy}</p> : null}
      <p className="text-xs text-muted">Las horas se guardan como 08:00. Podés escribir 8, 8:00 u 08:00.</p>
    </div>
  );
}