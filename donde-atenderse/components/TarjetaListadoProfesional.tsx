import Link from "next/link";
import { AvatarProfesionalListado } from "@/components/MediaListado";
import { InsigniaVerificacion } from "@/components/InsigniaVerificacion";
import type { VistaProfesional } from "@/lib/view";

export function TarjetaListadoProfesional({
  id,
  vista,
  ejemplo = false,
}: {
  id: string;
  vista: VistaProfesional;
  ejemplo?: boolean;
}) {
  return (
    <Link href={`/profesional/${id}`} className="tarjeta block transition hover:border-link">
      <div className="flex gap-3">
        <AvatarProfesionalListado nombre={vista.nombre} photoUrl={vista.fotoUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-ink">{vista.nombre}</h2>
            <InsigniaVerificacion activa={vista.datosVerificados} compacta />
          </div>
          <p className="mt-0.5 text-muted">
            {vista.especialidad} · {vista.area}
            {ejemplo ? " · Dato de ejemplo" : ""}
          </p>
          <ul className="mt-2 grid gap-2 text-sm">
            {vista.bloques.flatMap((bloque) =>
              bloque.lineas.map((linea) => (
                <li key={linea.id}>
                  <span className="font-semibold text-ink">
                    {linea.rotulo}
                    {linea.locality ? ` · ${linea.locality}` : ""}
                  </span>
                  {linea.detalle ? <p className="mt-0.5 text-muted">{linea.detalle}</p> : null}
                </li>
              )),
            )}
          </ul>
        </div>
      </div>
    </Link>
  );
}