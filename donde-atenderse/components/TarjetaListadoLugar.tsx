import Link from "next/link";
import { LogoLugarListado } from "@/components/MediaListado";
import { InsigniaVerificacion } from "@/components/InsigniaVerificacion";
import { etiquetaLugar } from "@/lib/format";
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
          <p className="mt-0.5 text-muted">
            {etiquetaLugar(lugar.kind)} · {lugar.locality}
            {lugar.example ? " · Dato de ejemplo" : ""}
          </p>
          {lugar.studies.length > 0 ? (
            <p className="mt-1 text-sm">{lugar.studies.map((estudio) => estudio.name).join(" · ")}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}