import Link from "next/link";
import { IconoCercalud, iconoArea } from "@/components/iconos/IconoCercalud";
import { AvatarProfesionalListado } from "@/components/MediaListado";
import { InsigniaVerificacion } from "@/components/InsigniaVerificacion";
import { ListaHorarioTexto } from "@/components/ListaHorarioTexto";
import { MENSAJE_WHATSAPP } from "@/lib/constants";
import { enlaceWhatsApp, etiquetaArea } from "@/lib/format";
import type { ProfesionalEnLugar } from "@/lib/lugarEquipo";

/** Fila densa para listados (muchos profesionales en un mismo lugar). */
export function FichaProfesionalEnLugar({
  persona,
  enLista = false,
}: {
  persona: ProfesionalEnLugar;
  /** Dentro de `lista-profesionales-lugar`: sin borde propio, separador horizontal del contenedor. */
  enLista?: boolean;
}) {
  const horarioLineas =
    persona.horarioLineas.length > 0 ? persona.horarioLineas : ["Sin horario cargado en este lugar."];

  return (
    <article className={enLista ? "fila-profesional-lista" : "fila-profesional flex gap-3"}>
      <AvatarProfesionalListado nombre={persona.fullName} photoUrl={persona.photoUrl} tamano="lista" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/profesional/${persona.id}`}
              className="text-base font-bold leading-tight text-link hover:underline"
            >
              {persona.fullName}
            </Link>
            <p className="enlace-icono mt-0.5 text-xs text-menta">
              <IconoCercalud nombre={iconoArea(persona.area)} size={14} className="shrink-0 text-menta" />
              <span>
                {persona.specialty} · {etiquetaArea(persona.area)}
                {persona.license ? ` · Mat. ${persona.license}` : ""}
              </span>
            </p>
          </div>
          <InsigniaVerificacion activa={persona.datosVerificados} compacta />
        </div>
        <div className="mt-1">
          <ListaHorarioTexto lineas={horarioLineas} compacto />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-semibold">
          <Link href={`/profesional/${persona.id}`} className="enlace-icono text-link hover:underline">
            <IconoCercalud nombre="ficha" size={15} className="text-menta" />
            Ver ficha
          </Link>
          {persona.whatsapp ? (
            <a
              className="enlace-icono text-link hover:underline"
              href={enlaceWhatsApp(persona.whatsapp, MENSAJE_WHATSAPP)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconoCercalud nombre="mensaje" size={15} className="text-menta" />
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}