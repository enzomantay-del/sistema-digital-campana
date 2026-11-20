import Image from "next/image";
import Link from "next/link";
import { TarjetaPublicidad } from "@/components/TarjetaPublicidad";
import { PROFESIONAL_PUBLICIDAD_ORTIZ } from "@/lib/ejemplo";
import { enlaceWhatsApp, etiquetaArea } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { lineasHorarioLugar } from "@/lib/placeSchedule";

export async function PublicidadProfesionalOrtiz() {
  const persona = await prisma.professional.findFirst({
    where: { published: true, fullName: PROFESIONAL_PUBLICIDAD_ORTIZ },
    include: { attendances: { include: { place: true }, take: 3 } },
  });
  if (!persona) return null;

  const foto = persona.photoUrl?.trim() || "/ejemplos/dr-ivan-ortiz.svg";
  const lugares = persona.attendances.map((item) => {
    const lineas = lineasHorarioLugar(item.professionalScheduleNote);
    const horario =
      lineas.length > 0
        ? lineas.join(" ")
        : [item.professionalDays, item.professionalTime].filter(Boolean).join(" · ") || "Consultar horario";
    return { nombre: item.place.name, localidad: item.place.locality, horario };
  });

  return (
    <TarjetaPublicidad pie="Destacado de ejemplo con datos reales de la ficha en Cercalud.">
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line bg-white">
          <Image
            src={foto}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold leading-tight">{persona.fullName}</p>
          <p className="text-xs text-menta">
            {persona.specialty || "Especialidad"} · {etiquetaArea(persona.area)}
          </p>
        </div>
      </div>
      {lugares.length > 0 ? (
        <ul className="grid gap-2 text-sm">
          {lugares.map((lugar) => (
            <li key={lugar.nombre} className="rounded-xl border border-line bg-[#f8fafc] px-3 py-2">
              <p className="font-semibold">{lugar.nombre}</p>
              <p className="text-xs text-muted">{lugar.localidad}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted">{lugar.horario}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Link href={`/profesional/${persona.id}`} className="boton flex-1 min-w-[8rem] text-center text-sm">
          Ver ficha
        </Link>
        {persona.whatsapp ? (
          <a
            className="boton-suave flex-1 min-w-[8rem] text-center text-sm"
            href={enlaceWhatsApp(persona.whatsapp, `Hola ${persona.fullName}, te escribo desde Cercalud.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        ) : null}
      </div>
    </TarjetaPublicidad>
  );
}