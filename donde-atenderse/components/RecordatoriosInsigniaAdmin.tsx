import Link from "next/link";
import {
  enlaceRecordatorioProfesional,
  enlaceRecordatorioSecretaria,
  type FilaRecordatorioInsignia,
} from "@/lib/recordatorioInsignia";
import { fecha } from "@/lib/format";

export function RecordatoriosInsigniaAdmin({ filas }: { filas: FilaRecordatorioInsignia[] }) {
  if (filas.length === 0) {
    return (
      <p className="text-sm text-muted">
        Nadie está por vencer la insignia en los próximos 5 días (fichas publicadas, sin contar ejemplos).
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-ink">
        {filas.length} ficha{filas.length === 1 ? "" : "s"} con insignia por vencer o recién vencida. Un clic abre
        WhatsApp con el mensaje listo; editalo si hace falta antes de enviar.
      </p>
      <ul className="grid gap-2">
        {filas.map((fila) => {
          const linkPro = enlaceRecordatorioProfesional(fila);
          const etiquetaDias =
            fila.diasRestantes <= 0
              ? `Venció hace ${Math.abs(fila.diasRestantes)} día${Math.abs(fila.diasRestantes) === 1 ? "" : "s"}`
              : fila.diasRestantes === 1
                ? "Vence mañana"
                : `Vence en ${fila.diasRestantes} días`;
          return (
            <li
              key={fila.id}
              className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white px-3 py-2.5 text-sm"
            >
              <div className="min-w-0 flex-1 grid gap-0.5">
                <span className="font-semibold text-ink">
                  <Link href={`/panel/admin/profesional/${fila.id}`} className="hover:text-link">
                    {fila.nombre}
                  </Link>
                  {fila.especialidad ? <span className="font-normal text-muted"> · {fila.especialidad}</span> : null}
                </span>
                <span className="text-xs text-muted">
                  {etiquetaDias}
                  {fila.ultimaActualizacion ? ` · Última actualización ${fecha(fila.ultimaActualizacion)}` : null}
                  {!fila.verificado ? " · Sin insignia en la web" : null}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {linkPro ? (
                  <a
                    href={linkPro}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="boton !py-1.5 !text-xs"
                  >
                    WhatsApp profesional
                  </a>
                ) : (
                  <span className="text-xs text-warn">Sin WhatsApp en la ficha</span>
                )}
                {fila.contactosLugar.map((lugar) => {
                  const linkSec = enlaceRecordatorioSecretaria(fila, lugar);
                  if (!linkSec) return null;
                  return (
                    <a
                      key={lugar.placeId}
                      href={linkSec}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="boton-suave !py-1.5 !text-xs"
                      title={`Contacto del lugar: ${lugar.lugarNombre}`}
                    >
                      WhatsApp {lugar.lugarNombre.length > 22 ? `${lugar.lugarNombre.slice(0, 20)}…` : lugar.lugarNombre}
                    </a>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}