import { redirect } from "next/navigation";
import { EditorProfesional } from "@/components/EditorProfesional";
import { usuarioActual } from "@/lib/auth";
import { horarioProfesional } from "@/lib/map";
import { prisma } from "@/lib/prisma";
import { catalogoObras } from "@/lib/search";

export default async function PaginaEditorProfesional() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  const professional =
    usuario.professional ??
    (await prisma.professional.create({
      data: { userId: usuario.id, fullName: usuario.name, published: true },
    }));
  const completo = await prisma.professional.findUniqueOrThrow({
    where: { id: professional.id },
    include: {
      obras: { include: { obra: true } },
      attendances: { include: { place: true } },
    },
  });
  const [lugares, obras] = await Promise.all([
    prisma.place.findMany({
      where: { kind: { not: "farmacia" } },
      select: { id: true, name: true, locality: true },
      orderBy: { name: "asc" },
    }),
    catalogoObras(),
  ]);
  const propios = new Set(usuario.places.map((item) => item.placeId));

  return (
    <EditorProfesional
      obras={obras}
      lugares={lugares}
      inicial={{
        fullName: completo.fullName,
        license: completo.license,
        area: completo.area,
        specialty: completo.specialty,
        whatsapp: completo.whatsapp,
        phone: completo.phone,
        price: completo.price,
        priceUpdatedAt: completo.priceUpdatedAt ? completo.priceUpdatedAt.toISOString() : null,
        obras: completo.obras.map((item) => item.obra.name),
        otraObra: "",
        horarios: completo.attendances.map((item) => horarioProfesional(item, propios.has(item.placeId))),
      }}
    />
  );
}
