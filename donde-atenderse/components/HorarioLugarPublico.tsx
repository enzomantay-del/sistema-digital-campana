import { franjasHorarioLugarPublico, lugarTieneGuardia24h } from "@/lib/placeSchedule";

export function HorarioLugarPublico({
  scheduleNote,
  lineasFallback,
  textoFallback,
}: {
  scheduleNote: string;
  lineasFallback: string[];
  textoFallback: string;
}) {
  const franjas = franjasHorarioLugarPublico(scheduleNote);
  const guardia = lugarTieneGuardia24h(scheduleNote);

  if (franjas.length === 0) {
    if (lineasFallback.length === 0 && !textoFallback.trim()) return null;
    return (
      <section className="grid gap-2">
        <h2 className="text-xl font-semibold">Horario del lugar</h2>
        {lineasFallback.length > 0 ? (
          <ul className="grid gap-1 text-base">
            {lineasFallback.map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>
        ) : (
          <p>{textoFallback}</p>
        )}
      </section>
    );
  }

  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-semibold">Horario del lugar</h2>
      {guardia ? (
        <div className="rounded-2xl border-2 border-warn/50 bg-gradient-to-r from-amber-50 to-white px-4 py-3 shadow-sm">
          <p className="text-lg font-bold tracking-tight text-ink">Guardia las 24 horas</p>
          <p className="text-sm text-muted">Atención de urgencia y guardia, todos los días del bloque indicado abajo.</p>
        </div>
      ) : null}
      <ul className="grid gap-3">
        {franjas.map((franja) => (
          <li key={franja.diasLabel} className="rounded-2xl border border-line bg-[#f8fafc] px-4 py-3">
            <p className="font-semibold">{franja.diasLabel}</p>
            {franja.cerrado ? (
              <p className="mt-1 text-sm text-muted">Sin atención en esos días.</p>
            ) : (
              <ul className="mt-2 grid gap-1.5">
                {franja.guardia24 ? (
                  <li className="flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="rounded-full bg-warn/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-warn">
                      Guardia 24 h
                    </span>
                    <span>Atención continua</span>
                  </li>
                ) : null}
                {franja.turnos.map((turno) => (
                  <li key={turno.label} className="flex flex-wrap gap-x-2 text-sm">
                    <span className="font-medium text-ink">{turno.label}</span>
                    <span className="text-muted">{turno.rango || "—"}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}