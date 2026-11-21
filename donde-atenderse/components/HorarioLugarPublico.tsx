import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { ListaHorarioTexto } from "@/components/ListaHorarioTexto";
import { lineasHorarioLugar, lugarTieneGuardia24h } from "@/lib/placeSchedule";

export function HorarioLugarPublico({
  scheduleNote,
  lineasFallback,
  textoFallback,
}: {
  scheduleNote: string;
  lineasFallback: string[];
  textoFallback: string;
}) {
  const lineas = lineasHorarioLugar(scheduleNote);
  const horario = lineas.length > 0 ? lineas : lineasFallback;
  const guardia = lugarTieneGuardia24h(scheduleNote);

  if (horario.length === 0 && !textoFallback.trim()) return null;

  return (
    <section className="grid gap-3">
      <h2 className="enlace-icono text-xl font-semibold">
        <IconoCercalud nombre="reloj" size={22} className="text-menta" />
        Horario del lugar
      </h2>
      {guardia ? (
        <div className="rounded-2xl border-2 border-warn/50 bg-gradient-to-r from-amber-50 to-white px-4 py-3 shadow-sm">
          <p className="text-lg font-bold tracking-tight text-ink">Guardia las 24 horas</p>
          <p className="text-sm text-muted">Atención de urgencia y guardia en el bloque indicado abajo.</p>
        </div>
      ) : null}
      {horario.length > 0 ? (
        <ListaHorarioTexto lineas={horario} />
      ) : (
        <p className="text-base text-ink">{textoFallback}</p>
      )}
    </section>
  );
}