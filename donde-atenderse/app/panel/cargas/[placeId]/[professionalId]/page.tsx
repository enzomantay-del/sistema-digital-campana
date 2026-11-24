import { notFound, redirect } from "next/navigation";
import { EditorProfesional } from "@/components/EditorProfesional";
import { AvisoFotosHosting } from "@/components/AvisoFotosHosting";
import { esSecretaria, usuarioActual } from "@/lib/auth";
import { borradorDesdeProfesional, horarioBorradorParaLugar } from "@/lib/cargarBorradorProfesional";
import { prisma } from "@/lib/prisma";
import { catalogoObras } from "@/lib/search";

export default async function EditarFichaEnLugar({
  params,
}: {
  params: Promise<{ placeId: string; professionalId: string }>;
}) {
  const { placeId, professionalId } = await params;
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  if (!esSecretaria(usuario)) redirect("/panel");
  if (!usuario.places.some((item) => item.placeId === placeId)) notFound();

  const lugar = await prisma.place.findUnique({ where: { id: placeId } });
  if (!lugar) notFound();

  const completo = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: {
      obras: { include: { obra: true } },
      attendances: { include: { place: true, obras: { include: { obra: true } } } },
    },
  });
  if (!completo) notFound();

  const obras = await catalogoObras();
  let borrador = borradorDesdeProfesional(completo, {
    placeIds: [placeId],
    editorEnLugar: () => true,
  });
  if (borrador.horarios.length === 0) {
    borrador = { ...borrador, horarios: [horarioBorradorParaLugar(lugar)] };
  }

  return (
    <div className="grid gap-4">
      <AvisoFotosHosting />
      <p className="text-sm text-muted">
        Editás la ficha de <strong>{completo.fullName}</strong> y el horario en <strong>{lugar.name}</strong>. Los
        horarios en otros lugares los carga cada secretaría de ese lugar.
      </p>
      <EditorProfesional
        professionalId={completo.id}
        modoSecretaria
        placeIdEnfoque={placeId}
        obras={obras}
        lugares={[{ id: lugar.id, name: lugar.name, locality: lugar.locality, kind: lugar.kind }]}
        revisada={completo.reviewed}
        publicada={completo.published}
        volverHref={`/panel/cargas/${placeId}`}
        inicial={borrador}
      />
    </div>
  );
}