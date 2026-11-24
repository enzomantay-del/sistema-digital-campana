import { expandirLineasHorario, partirLineaHorario, trozosDetalleHorario } from "@/lib/horarioPresentacion";
import {
  complementoHorarioLugar,
  franjasHorarioLugarPublico,
  type FranjaHorarioPublica,
} from "@/lib/placeSchedule";

function TarjetaFranja({
  franja,
  tarjeta,
  tituloClase,
  turnoClase,
}: {
  franja: FranjaHorarioPublica;
  tarjeta: string;
  tituloClase: string;
  turnoClase: string;
}) {
  return (
    <li className={tarjeta}>
      <p className={tituloClase}>{franja.diasLabel}</p>
      {franja.cerrado ? (
        <p className={`mt-0.5 ${turnoClase} text-muted`}>Cerrado</p>
      ) : franja.guardia24 ? (
        <p className={`mt-0.5 ${turnoClase} font-medium text-ink`}>Guardia las 24 h</p>
      ) : (
        <ul className="mt-1 grid gap-0.5">
          {franja.turnos.map((turno) => (
            <li
              key={`${franja.diasLabel}-${turno.label}`}
              className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${turnoClase}`}
            >
              <span className="font-medium text-link">{turno.label}</span>
              <span className="tabular-nums font-medium text-ink">{turno.rango}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function TarjetaLinea({
  linea,
  tarjeta,
  tituloClase,
  turnoClase,
}: {
  linea: string;
  tarjeta: string;
  tituloClase: string;
  turnoClase: string;
}) {
  const { titulo, detalle } = partirLineaHorario(linea);
  const trozos = trozosDetalleHorario(detalle);

  if (!titulo) {
    return (
      <li className={`${tarjeta} ${turnoClase} text-ink`}>{linea}</li>
    );
  }

  return (
    <li className={tarjeta}>
      <p className={tituloClase}>{titulo}</p>
      {trozos.length > 1 ? (
        <ul className="mt-1 grid gap-0.5">
          {trozos.map((troz) => {
            const espacio = troz.indexOf(" ");
            const etiqueta = espacio > 0 ? troz.slice(0, espacio) : "";
            const resto = espacio > 0 ? troz.slice(espacio + 1) : troz;
            return (
              <li key={troz} className={`flex flex-wrap items-baseline gap-x-2 ${turnoClase}`}>
                {etiqueta ? <span className="font-medium capitalize text-link">{etiqueta}</span> : null}
                <span className="tabular-nums font-medium text-ink">{resto || troz}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={`mt-0.5 ${turnoClase} font-medium tabular-nums text-ink`}>{detalle}</p>
      )}
    </li>
  );
}

/** Horarios en bloques cortos: días, turno y rango en filas fáciles de escanear. */
export function HorarioLegible({
  lineas,
  scheduleNote,
  className = "",
  denso = false,
}: {
  lineas: string[];
  scheduleNote?: string;
  className?: string;
  /** Menos padding cuando la ficha tiene muchas sedes. */
  denso?: boolean;
}) {
  const tarjeta = denso
    ? "rounded-xl border border-line bg-white/80 px-3 py-2 shadow-sm"
    : "rounded-2xl border border-line bg-white/80 px-4 py-3 shadow-sm";
  const tituloClase = denso ? "text-xs font-semibold text-menta" : "text-sm font-semibold text-menta";
  const turnoClase = denso ? "text-xs" : "text-sm";
  const franjas = scheduleNote ? franjasHorarioLugarPublico(scheduleNote) : [];
  const complemento = scheduleNote ? complementoHorarioLugar(scheduleNote) : "";
  const lineasVisibles = expandirLineasHorario(lineas);

  const gapLista = denso ? "gap-1" : "gap-2";

  if (franjas.length > 0) {
    return (
      <ul className={`grid ${gapLista} ${className}`}>
        {franjas.map((franja) => (
          <TarjetaFranja
            key={franja.diasLabel + franja.turnos.map((t) => t.label).join()}
            franja={franja}
            tarjeta={tarjeta}
            tituloClase={tituloClase}
            turnoClase={turnoClase}
          />
        ))}
        {complemento ? (
          <li className={`${tarjeta} ${turnoClase} text-ink`}>{complemento}</li>
        ) : null}
      </ul>
    );
  }

  if (lineasVisibles.length === 0) return null;

  return (
    <ul className={`grid ${gapLista} ${className}`}>
      {lineasVisibles.map((linea) => (
        <TarjetaLinea key={linea} linea={linea} tarjeta={tarjeta} tituloClase={tituloClase} turnoClase={turnoClase} />
      ))}
    </ul>
  );
}