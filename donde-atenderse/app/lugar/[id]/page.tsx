import { notFound } from "next/navigation";
import { FichaLugar } from "@/components/FichaLugar";
import { filaHorario } from "@/lib/map";
import { equipoPublicadoEnLugar } from "@/lib/lugarEquipo";
import { obrasModoEfectivo } from "@/lib/placeObras";
import { prisma } from "@/lib/prisma";
import { armarVistaLugar } from "@/lib/view";

export default async function PaginaLugar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lugar = await prisma.place.findUnique({
    where: { id },
    include: {
      obras: { include: { obra: true } },
      studies: { orderBy: { name: "asc" } },
      attendances: { include: { place: true, professional: true } },
    },
  });
  if (!lugar || !lugar.published || lugar.kind === "farmacia") notFound();
  const equipo = await equipoPublicadoEnLugar(id);
  const vista = armarVistaLugar({
    placeId: lugar.id,
    name: lugar.name,
    kind: lugar.kind,
    locality: lugar.locality,
    address: lugar.address,
    whatsapp: lugar.whatsapp,
    phone: lugar.phone,
    scheduleNote: lugar.scheduleNote,
    obrasMode: obrasModoEfectivo(lugar.kind, lugar.obrasMode),
    obras: lugar.obras.map((item) => item.obra.name),
    cantidadProfesionales: equipo.cantidad,
    especialidades: equipo.especialidades,
    updatedAt: lugar.updatedAt,
    studies: lugar.studies,
    filas: lugar.attendances
      .filter((item) => item.professional.published)
      .map((item) => filaHorario({ ...item, professional: item.professional })),
  });
  return (
    <div className="max-w-2xl">
      <FichaLugar vista={vista} ejemplo={lugar.example} />
    </div>
  );
}