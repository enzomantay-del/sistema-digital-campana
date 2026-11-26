import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { partesVigenciaTurnoFarmacia } from "@/lib/format";

export function BloqueVigenciaTurno({ desde, hasta }: { desde: Date; hasta: Date }) {
  const { desde: inicio, hasta: fin } = partesVigenciaTurnoFarmacia(desde, hasta);

  return (
    <section
      className="grid gap-3 rounded-2xl border border-line bg-gradient-to-br from-slate-50 to-white px-4 py-4"
      aria-label="Vigencia del turno"
    >
      <p className="enlace-icono text-sm font-semibold text-ink">
        <IconoCercalud nombre="reloj" size={18} className="text-menta" />
        Vigencia del turno
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-0.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Inicio</p>
          <p className="text-base font-semibold text-ink">{inicio.fecha}</p>
          <p className="text-lg tabular-nums text-link">{inicio.hora}</p>
        </div>
        <div className="grid gap-0.5 sm:border-l sm:border-line sm:pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Fin</p>
          <p className="text-base font-semibold text-ink">{fin.fecha}</p>
          <p className="text-lg tabular-nums text-link">{fin.hora}</p>
        </div>
      </div>
      <p className="text-xs text-muted">Horario de Misiones (Argentina).</p>
    </section>
  );
}