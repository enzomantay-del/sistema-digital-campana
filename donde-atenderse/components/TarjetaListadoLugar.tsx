import Link from "next/link";
import { IconoCercalud, iconoLugar } from "@/components/iconos/IconoCercalud";
import { LogoLugarListado } from "@/components/MediaListado";
import { InsigniaVerificacion } from "@/components/InsigniaVerificacion";
import { etiquetaLugar } from "@/lib/format";
import { resumenEstudios } from "@/lib/resumenEstudios";
import { lugarVerificadoEnListado } from "@/lib/verificacion";

export function TarjetaListadoLugar({
  lugar,
}: {
  lugar: {
    id: string;
    name: string;
    kind: string;
    locality: string;
    logoUrl: string;
    example: boolean;
    updatedAt: Date;
    attendances?: { placeUpdatedAt: Date | null }[];
    studies: { name: string }[];
  };
}) {
  const verificado = lugarVerificadoEnListado(lugar);

  return (
    <Link href={`/lugar/${lugar.id}`} className="tarjeta block transition hover:border-link">
      <div className="flex gap-3">
        <LogoLugarListado nombre={lugar.name} logoUrl={lugar.logoUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-2xl font-bold leading-tight tracking-tight">{lugar.name}</h2>
            <InsigniaVerificacion activa={verificado} compacta />
          </div>
          <p className="enlace-icono mt-0.5 text-muted">
            <IconoCercalud nombre={iconoLugar(lugar.kind)} size={15} className="shrink-0 text-menta" />
            <span>
              {etiquetaLugar(lugar.kind)} · {lugar.locality}
              {lugar.example ? " · Dato de ejemplo" : ""}
            </span>
          </p>
          {lugar.studies.length > 0 ? (
            <p className="enlace-icono mt-1 text-sm">
              <IconoCercalud nombre="estudios" size={14} className="shrink-0 text-menta" />
              <span>{resumenEstudios(lugar.studies.map((estudio) => estudio.name))}</span>
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}