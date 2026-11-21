import Image from "next/image";
import Link from "next/link";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { TarjetaPublicidad } from "@/components/TarjetaPublicidad";
import { PROFESIONAL_PUBLICIDAD_ORTIZ } from "@/lib/ejemplo";
import { enlaceWhatsApp, etiquetaArea } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { lineasHorarioAtencion } from "@/lib/horarioTexto";

export async function PublicidadProfesionalOrtiz() {
  const persona = await prisma.professional.findFirst({
    where: { published: true, fullName: PROFESIONAL_PUBLICIDAD_ORTIZ },
    include: { attendances: { include: { place: true }, take: 1 } },
  });
  if (!persona) return null;

  const foto = persona.photoUrl?.trim() || "/ejemplos/dr-ivan-ortiz.png";
  const primerLugar = persona.attendances[0];
  const horarioLineas =
    primerLugar &&
    lineasHorarioAtencion({
      scheduleNote: primerLugar.professionalScheduleNote,
      days: primerLugar.professionalDays,
      time: primerLugar.professionalTime,
      shift: primerLugar.professionalShift,
    });
  const horario = horarioLineas?.[0] ?? null;
  const lugar = primerLugar ? `${primerLugar.place.name} · ${primerLugar.place.locality}` : etiquetaArea(persona.area);

  return (
    <TarjetaPublicidad>
      <div className="relative aspect-[2/1] overflow-hidden rounded-xl bg-[#1e3a5f]">
        <Image src={foto} alt="" fill className="object-cover object-[center_18%]" sizes="400px" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12275c]/95 via-[#12275c]/35 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-200">Turnos esta semana</p>
          <p className="text-xl font-extrabold leading-tight">Consulta psiquiátrica sin demoras</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-line bg-white">
          <Image src={foto} alt="" fill className="object-cover object-top" sizes="44px" unoptimized />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight">{persona.fullName}</p>
          <p className="truncate text-sm text-muted">
            {persona.specialty} · {lugar}
          </p>
        </div>
      </div>
      {horario ? (
        <p className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-950">
          Próximo bloque: {horario}
        </p>
      ) : null}
      <div className="grid gap-2">
        {persona.whatsapp ? (
          <a
            className="boton w-full gap-2 text-center text-base font-bold"
            href={enlaceWhatsApp(persona.whatsapp, "Hola Dr., quiero pedir un turno. Vi su aviso en Cercalud.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconoCercalud nombre="mensaje" size={18} className="text-white/95" />
            Sacar turno por WhatsApp
          </a>
        ) : null}
        <Link href={`/profesional/${persona.id}`} className="boton-suave w-full gap-2 text-center text-sm font-semibold">
          <IconoCercalud nombre="ficha" size={17} className="text-link" />
          Ver ficha completa
        </Link>
      </div>
    </TarjetaPublicidad>
  );
}