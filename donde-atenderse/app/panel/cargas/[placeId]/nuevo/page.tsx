import { notFound, redirect } from "next/navigation";
import { EditorProfesional } from "@/components/EditorProfesional";
import { AvisoFotosHosting } from "@/components/AvisoFotosHosting";
import { esSecretaria, usuarioActual } from "@/lib/auth";
import { horarioBorradorParaLugar } from "@/lib/cargarBorradorProfesional";
import { prisma } from "@/lib/prisma";
import { catalogoObras } from "@/lib/search";

export default async function NuevaFichaEnLugar({ params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  if (!esSecretaria(usuario)) redirect("/panel");
  if (!usuario.places.some((item) => item.placeId === placeId)) notFound();

  const lugar = await prisma.place.findUnique({ where: { id: placeId } });
  if (!lugar?.published) notFound();

  const obras = await catalogoObras();
  const borradorVacio = await prisma.professional.create({
    data: { fullName: "", published: false, reviewed: false },
  });

  return (
    <div className="grid gap-4">
      <AvisoFotosHosting />
      <EditorProfesional
        professionalId={borradorVacio.id}
        modoSecretaria
        placeIdEnfoque={placeId}
        obras={obras}
        lugares={[{ id: lugar.id, name: lugar.name, locality: lugar.locality, kind: lugar.kind }]}
        revisada={false}
        publicada={false}
        volverHref={`/panel/cargas/${placeId}`}
        inicial={{
          fullName: "",
          license: "",
          area: "cuerpo",
          specialty: "",
          specialties: [],
          photoUrl: "",
          whatsapp: "",
          phone: "",
          price: "",
          priceUpdatedAt: null,
          obras: [],
          otraObra: "",
          horarios: [horarioBorradorParaLugar(lugar)],
        }}
      />
    </div>
  );
}