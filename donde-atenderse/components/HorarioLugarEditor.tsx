"use client";

import type { GrupoHorarioLugar, HorarioLugarData, IdTurnoHorarioLugar } from "@/lib/placeSchedule";
import { TURNOS_HORARIO_LUGAR, normalizarHora } from "@/lib/placeSchedule";

function GrupoEditor({
  titulo,
  grupo,
  onChange,
}: {
  titulo: string;
  grupo: GrupoHorarioLugar;
  onChange: (grupo: GrupoHorarioLugar) => void;
}) {
  function cambiarTurno(id: IdTurnoHorarioLugar, parcial: Partial<GrupoHorarioLugar[IdTurnoHorarioLugar]>) {
    onChange({ ...grupo, [id]: { ...grupo[id], ...parcial } });
  }

  return (
    <fieldset className="grid gap-3 rounded-2xl border border-line p-4">
      <legend className="px-1 text-sm font-semibold">{titulo}</legend>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={grupo.guardia24}
          onChange={(event) => onChange({ ...grupo, guardia24: event.target.checked })}
        />
        Guardia las 24 h
      </label>
      {TURNOS_HORARIO_LUGAR.map((turno) => {
        const datos = grupo[turno.id];
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
    </fieldset>
  );
}

export function HorarioLugarEditor({
  valor,
  legacy,
  onChange,
}: {
  valor: HorarioLugarData;
  legacy: string | null;
  onChange: (valor: HorarioLugarData) => void;
}) {
  return (
    <div className="grid gap-3">
      <GrupoEditor titulo="Lunes a viernes" grupo={valor.semana} onChange={(semana) => onChange({ ...valor, semana })} />
      <GrupoEditor titulo="Sábado y domingo" grupo={valor.finde} onChange={(finde) => onChange({ ...valor, finde })} />
      {legacy ? <p className="text-sm text-muted">Horario anterior (solo lectura): {legacy}</p> : null}
      <p className="text-xs text-muted">Las horas se guardan como 08:00. Podés escribir 8, 8:00 u 08:00.</p>
    </div>
  );
}