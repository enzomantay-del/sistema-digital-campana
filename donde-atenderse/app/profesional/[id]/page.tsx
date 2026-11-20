import { notFound } from "next/navigation";
import { FichaProfesional } from "@/components/FichaProfesional";
import { filaHorario } from "@/lib/map";
import { prisma } from "@/lib/prisma";
import { armarVistaProfesional } from "@/lib/view";

export default async function PaginaProfesional({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const persona = await prisma.professional.findUnique({
    where: { id },
    include: { obras: { include: { obra: true } }, attendances: { include: { place: true } } },
  });
  if (!persona || !persona.published) notFound();
  const vista = armarVistaProfesional({
    fullName: persona.fullName,
    specialty: persona.specialty,
    area: persona.area,
    license: persona.license,
    photoUrl: persona.photoUrl,
    price: persona.price,
    priceUpdatedAt: persona.priceUpdatedAt,
    whatsapp: persona.whatsapp,
    phone: persona.phone,
    obras: persona.obras.map((item) => item.obra.name),
    updatedAt: persona.updatedAt,
    filas: persona.attendances.map(filaHorario),
  });
  return (
    <div className="max-w-2xl">
      <FichaProfesional vista={vista} ejemplo={persona.example} />
    </div>
  );
}
