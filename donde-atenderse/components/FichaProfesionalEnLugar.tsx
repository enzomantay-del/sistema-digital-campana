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

export function FichaProfesionalEnLugar({
  persona,
  compacto = false,
}: {
  persona: ProfesionalEnLugar;
  compacto?: boolean;
}) {
  return (
    <article className={`tarjeta grid gap-4 ${compacto ? "" : "sm:grid-cols-[5.5rem_1fr] sm:items-start"}`}>
      <div className={`flex gap-3 ${compacto ? "items-center" : "sm:flex-col sm:items-center"}`}>
        {persona.photoUrl ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-line bg-white shadow-sm">
            <Image src={persona.photoUrl} alt="" fill className="object-cover" sizes="80px" unoptimized />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-line bg-[#eef4f8] text-xl font-bold text-link">
            {iniciales(persona.fullName) || "?"}
          </div>
        )}
        {compacto ? (
          <div className="min-w-0 flex-1">
            <Cabecera persona={persona} />
          </div>
        ) : null}
      </div>
      <div className="grid min-w-0 gap-3">
        {!compacto ? <Cabecera persona={persona} /> : null}
        {persona.license ? <p className="text-sm text-muted">Matrícula {persona.license}</p> : null}
        <HorarioBloque lineas={persona.horarioLineas} />
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href={`/profesional/${persona.id}`} className="boton-suave text-sm">
            Ver ficha completa
          </Link>
          {persona.whatsapp ? (
            <a
              className="boton text-sm"
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

function Cabecera({ persona }: { persona: ProfesionalEnLugar }) {
  return (
    <div className="grid gap-1">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/profesional/${persona.id}`} className="text-xl font-bold leading-tight text-link hover:underline">
          {persona.fullName}
        </Link>
        <InsigniaVerificacion activa={persona.datosVerificados} />
      </div>
      <p className="text-sm text-menta">
        {persona.specialty} · {etiquetaArea(persona.area)}
      </p>
    </div>
  );
}

function HorarioBloque({ lineas }: { lineas: string[] }) {
  if (lineas.length === 0) {
    return <p className="text-sm text-muted">Todavía no cargó horario en este lugar.</p>;
  }
  return (
    <div className="rounded-xl border border-line bg-[#f8fafc] px-3 py-2.5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">Horario en este lugar</p>
      <ul className="mt-1.5 grid gap-0.5">
        {lineas.map((linea) => (
          <li key={linea} className="text-sm font-medium">
            {linea}
          </li>
        ))}
      </ul>
    </div>
  );
}