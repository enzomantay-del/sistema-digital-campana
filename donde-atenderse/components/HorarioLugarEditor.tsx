"use client";

import { DIAS } from "@/lib/constants";
import type { FranjaHorarioLugar, HorarioLugarData, IdTurnoHorarioLugar } from "@/lib/placeSchedule";
import {
  TURNOS_HORARIO_LUGAR,
  diasEnConflicto,
  diasSinFranja,
  etiquetasDias,
  franjaHorarioVacia,
  grupoHorarioVacio,
  normalizarHora,
} from "@/lib/placeSchedule";

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

  return (
    <fieldset className="grid gap-3 rounded-2xl border border-line p-4">
      <legend className="px-1 text-sm font-semibold">Franja {indice + 1}</legend>
      <p className="text-xs text-muted">Elegí en qué días aplica este horario. Podés sumar más franjas si un día es distinto.</p>
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
      <TurnosEditor franja={franja} onChange={onChange} />
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
      for (const dia of franja.dias) set.add(dia);
    }
    return set;
  };

  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted">
        Armá <strong>una franja por cada combinación de días</strong> que comparte el mismo horario. Ejemplo: lun–vie con mañana y tarde;
        sábado solo por la mañana; domingo cerrado (franja con “cerrado”). Los días que no incluyas no muestran horario público.
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
      {legacy ? <p className="text-sm text-muted">Horario anterior (solo lectura): {legacy}</p> : null}
      <p className="text-xs text-muted">Las horas se guardan como 08:00. Podés escribir 8, 8:00 u 08:00.</p>
    </div>
  );
}