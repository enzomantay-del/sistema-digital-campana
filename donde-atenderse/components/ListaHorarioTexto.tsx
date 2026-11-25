import { HorarioLegible } from "@/components/HorarioLegible";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { textoHorarioUnido } from "@/lib/horarioTexto";

/** Presentación uniforme del horario en toda la web pública. */
export function ListaHorarioTexto({
  lineas,
  className = "text-base text-ink",
  compacto = false,
  denso = false,
  scheduleNote,
}: {
  lineas: string[];
  className?: string;
  compacto?: boolean;
  denso?: boolean;
  scheduleNote?: string;
}) {
  if (lineas.length === 0 && !scheduleNote?.trim()) return null;

  if (compacto) {
    const texto = textoHorarioUnido(lineas);
    return (
      <p className="enlace-icono line-clamp-2 text-xs leading-snug text-muted" title={texto}>
        <IconoCercalud nombre="reloj" size={13} className="shrink-0 text-menta/90" />
        <span>{texto}</span>
      </p>
    );
  }

  return (
    <HorarioLegible lineas={lineas} scheduleNote={scheduleNote} className={className} denso={denso} />
  );
}