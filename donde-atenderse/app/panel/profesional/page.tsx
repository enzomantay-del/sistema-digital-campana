import { redirect } from "next/navigation";
import { esAdmin, esProfesional, esSecretaria } from "@/lib/auth";
import { AvisoFotosHosting } from "@/components/AvisoFotosHosting";
import { EditorProfesional } from "@/components/EditorProfesional";
import { usuarioActual } from "@/lib/auth";
import { borradorDesdeProfesional } from "@/lib/cargarBorradorProfesional";
import { prisma } from "@/lib/prisma";
import { catalogoObras } from "@/lib/search";

export default async function PaginaEditorProfesional() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  if (esAdmin(usuario)) redirect("/panel/admin");
  if (esSecretaria(usuario)) redirect("/panel/cargas");
  if (!esProfesional(usuario) && !usuario.professional) redirect("/panel");
  const professional =
    usuario.professional ??
    (await prisma.professional.create({
      data: {
        userId: usuario.id,
        fullName: usuario.name,
        published: false,
        reviewed: false,
      },
    }));
  const completo = await prisma.professional.findUniqueOrThrow({
    where: { id: professional.id },
    include: {
      obras: { include: { obra: true } },
      attendances: { include: { place: true, obras: { include: { obra: true } } } },
    },
  });
  const [lugares, obras] = await Promise.all([
    prisma.place.findMany({
      where: { published: true, kind: { not: "farmacia" } },
      select: { id: true, name: true, locality: true, kind: true, whatsapp: true, phone: true },
      orderBy: [{ locality: "asc" }, { name: "asc" }],
    }),
    catalogoObras(),
  ]);
  const propios = new Set(usuario.places.map((item) => item.placeId));

  return (
    <div className="grid gap-4">
      <AvisoFotosHosting />
      <EditorProfesional
      professionalId={completo.id}
      obras={obras}
      lugares={lugares}
      revisada={completo.reviewed}
      publicada={completo.published}
      inicial={borradorDesdeProfesional(completo, {
        editorEnLugar: (placeId) => propios.has(placeId),
      })}
      />
    </div>
  );
}
