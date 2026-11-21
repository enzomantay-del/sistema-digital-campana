import Image from "next/image";
import Link from "next/link";
import { InsigniaVerificacion } from "@/components/InsigniaVerificacion";
import { MENSAJE_WHATSAPP } from "@/lib/constants";
import { enlaceWhatsApp, etiquetaArea } from "@/lib/format";
import type { ProfesionalEnLugar } from "@/lib/lugarEquipo";

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

/** Fila densa para listados (muchos profesionales en un mismo lugar). */
export function FichaProfesionalEnLugar({ persona }: { persona: ProfesionalEnLugar }) {
  const horario =
    persona.horarioLineas.length > 0
      ? persona.horarioLineas.join(" · ")
      : "Sin horario cargado en este lugar";

  return (
    <article className="fila-profesional flex gap-3">
      {persona.photoUrl ? (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-line bg-white">
          <Image src={persona.photoUrl} alt="" fill className="object-cover" sizes="48px" unoptimized />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-[#eef4f8] text-sm font-bold text-link">
          {iniciales(persona.fullName) || "?"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/profesional/${persona.id}`}
              className="text-base font-bold leading-tight text-link hover:underline"
            >
              {persona.fullName}
            </Link>
            <p className="mt-0.5 text-xs text-menta">
              {persona.specialty} · {etiquetaArea(persona.area)}
              {persona.license ? ` · Mat. ${persona.license}` : ""}
            </p>
          </div>
          <InsigniaVerificacion activa={persona.datosVerificados} compacta />
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted" title={horario}>
          {horario}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold">
          <Link href={`/profesional/${persona.id}`} className="text-link hover:underline">
            Ver ficha
          </Link>
          {persona.whatsapp ? (
            <a
              className="text-link hover:underline"
              href={enlaceWhatsApp(persona.whatsapp, MENSAJE_WHATSAPP)}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}