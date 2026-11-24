import { expandirLineasHorario, partirLineaHorario, trozosDetalleHorario } from "@/lib/horarioPresentacion";
import {
  complementoHorarioLugar,
  franjasHorarioLugarPublico,
  type FranjaHorarioPublica,
} from "@/lib/placeSchedule";

function TarjetaFranja({ franja }: { franja: FranjaHorarioPublica }) {
  return (
    <li className="rounded-2xl border border-line bg-white/80 px-4 py-3 shadow-sm">
      <p className="text-sm font-semibold text-menta">{franja.diasLabel}</p>
      {franja.cerrado ? (
        <p className="mt-1 text-sm text-muted">Cerrado</p>
      ) : franja.guardia24 ? (
        <p className="mt-1 text-sm font-medium text-ink">Guardia las 24 h</p>
      ) : (
        <ul className="mt-2 grid gap-1.5">
          {franja.turnos.map((turno) => (
            <li key={`${franja.diasLabel}-${turno.label}`} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
              <span className="font-medium text-link">{turno.label}</span>
              <span className="tabular-nums font-medium text-ink">{turno.rango}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function TarjetaLinea({ linea }: { linea: string }) {
  const { titulo, detalle } = partirLineaHorario(linea);
  const trozos = trozosDetalleHorario(detalle);

  if (!titulo) {
    return (
      <li className="rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink shadow-sm">{linea}</li>
    );
  }

  return (
    <li className="rounded-2xl border border-line bg-white/80 px-4 py-3 shadow-sm">
      <p className="text-sm font-semibold text-menta">{titulo}</p>
      {trozos.length > 1 ? (
        <ul className="mt-2 grid gap-1">
          {trozos.map((troz) => {
            const espacio = troz.indexOf(" ");
            const etiqueta = espacio > 0 ? troz.slice(0, espacio) : "";
            const resto = espacio > 0 ? troz.slice(espacio + 1) : troz;
            return (
              <li key={troz} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                {etiqueta ? <span className="font-medium capitalize text-link">{etiqueta}</span> : null}
                <span className="tabular-nums font-medium text-ink">{resto || troz}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-1 text-sm font-medium tabular-nums text-ink">{detalle}</p>
      )}
    </li>
  );
}

/** Horarios en bloques cortos: días, turno y rango en filas fáciles de escanear. */
export function HorarioLegible({
  lineas,
  scheduleNote,
  className = "",
}: {
  lineas: string[];
  scheduleNote?: string;
  className?: string;
}) {
  const franjas = scheduleNote ? franjasHorarioLugarPublico(scheduleNote) : [];
  const complemento = scheduleNote ? complementoHorarioLugar(scheduleNote) : "";
  const lineasVisibles = expandirLineasHorario(lineas);

  if (franjas.length > 0) {
    return (
      <ul className={`grid gap-2 ${className}`}>
        {franjas.map((franja) => (
          <TarjetaFranja key={franja.diasLabel + franja.turnos.map((t) => t.label).join()} franja={franja} />
        ))}
        {complemento ? (
          <li className="rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink shadow-sm">{complemento}</li>
        ) : null}
      </ul>
    );
  }

  if (lineasVisibles.length === 0) return null;

  return (
    <ul className={`grid gap-2 ${className}`}>
      {lineasVisibles.map((linea) => (
        <TarjetaLinea key={linea} linea={linea} />
      ))}
    </ul>
  );
}