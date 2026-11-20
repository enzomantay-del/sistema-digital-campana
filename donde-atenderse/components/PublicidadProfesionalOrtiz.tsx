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
    include: { attendances: { include: { place: true }, take: 2 } },
  });
  if (!persona) return null;

  const foto = persona.photoUrl?.trim() || "/ejemplos/dr-ivan-ortiz.svg";
  const primerLugar = persona.attendances[0];
  const horario =
    primerLugar &&
    (lineasHorarioLugar(primerLugar.professionalScheduleNote)[0] ||
      `${primerLugar.professionalTime || "Consultar horario"} en ${primerLugar.place.name}`);

  return (
    <TarjetaPublicidad>
      <div className="relative overflow-hidden rounded-xl border border-line">
        <div className="relative aspect-[5/4] w-full bg-[#1e3a5f]">
          <Image src={foto} alt="" fill className="object-cover object-top" sizes="400px" priority unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12275c] via-[#12275c]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <p className="text-sm font-bold text-sky-200">{persona.specialty} · {etiquetaArea(persona.area)}</p>
            <p className="text-2xl font-extrabold tracking-tight">{persona.fullName}</p>
          </div>
        </div>
      </div>
      <p className="text-lg font-bold leading-snug text-ink">¿Consulta psiquiátrica sin lista de espera?</p>
      <p className="text-sm text-muted">
        Pedí turno directo. Atiende con horario publicado en Cercalud para que sepas cuándo ir.
      </p>
      {horario ? (
        <p className="rounded-xl border border-line bg-[#f0f9ff] px-3 py-2 text-sm">
          <span className="font-semibold">Próximo bloque: </span>
          {horario}
        </p>
      ) : null}
      <div className="grid gap-2">
        {persona.whatsapp ? (
          <a
            className="boton w-full text-center text-base font-bold"
            href={enlaceWhatsApp(persona.whatsapp, `Hola Dr., quiero pedir un turno. Vi su aviso en Cercalud.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sacar turno por WhatsApp
          </a>
        ) : null}
        <Link href={`/profesional/${persona.id}`} className="boton-suave w-full text-center text-sm font-semibold">
          Ver ficha completa
        </Link>
      </div>
    </TarjetaPublicidad>
  );
}