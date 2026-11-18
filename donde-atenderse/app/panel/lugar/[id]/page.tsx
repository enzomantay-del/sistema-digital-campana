import { notFound, redirect } from "next/navigation";
import { EditorLugar } from "@/components/EditorLugar";
import { usuarioActual } from "@/lib/auth";
import { fechaInput } from "@/lib/format";
import { horarioLugar } from "@/lib/map";
import { prisma } from "@/lib/prisma";
import { catalogoObras } from "@/lib/search";

export default async function PaginaEditorLugar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  if (!usuario.places.some((item) => item.placeId === id)) notFound();

  const lugar = await prisma.place.findUnique({
    where: { id },
    include: {
      obras: { include: { obra: true } },
      studies: true,
      attendances: { include: { professional: true } },
      duties: { orderBy: { endsOn: "desc" }, take: 1 },
    },
  });
  if (!lugar) notFound();
  const obras = await catalogoObras();
  const turno = lugar.duties[0];

  return (
    <EditorLugar
      placeId={lugar.id}
      obras={obras}
      inicial={{
        name: lugar.name,
        kind: lugar.kind,
        locality: lugar.locality,
        address: lugar.address,
        whatsapp: lugar.whatsapp,
        phone: lugar.phone,
        scheduleNote: lugar.scheduleNote,
        obras: lugar.obras.map((item) => item.obra.name),
        otraObra: "",
        studies: lugar.studies.map((estudio) => ({
          key: estudio.id,
          id: estudio.id,
          name: estudio.name,
          preparation: estudio.preparation,
          attention: estudio.attention,
        })),
        horarios: lugar.attendances.map(horarioLugar),
        dutyStart: fechaInput(turno?.startsOn),
        dutyEnd: fechaInput(turno?.endsOn),
        dutySource: turno?.source ?? "",
      }}
    />
  );
}
