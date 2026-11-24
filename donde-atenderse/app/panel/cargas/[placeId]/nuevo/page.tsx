import { notFound, redirect } from "next/navigation";
import { EditorProfesional } from "@/components/EditorProfesional";
import { AvisoFotosHosting } from "@/components/AvisoFotosHosting";
import { esSecretaria, usuarioActual } from "@/lib/auth";
import { secretariaPuedeTrabajarFichaEnLugar } from "@/lib/permisosProfesional";
import { lugarPermiteCargaSecretaria } from "@/lib/lugarAsignacion";
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
  if (!lugar?.published || !lugarPermiteCargaSecretaria(lugar.kind)) notFound();

  const obras = await catalogoObras();
  const borradorVacio = await prisma.professional.create({
    data: { fullName: "", published: false, reviewed: false },
  });

  if (!(await secretariaPuedeTrabajarFichaEnLugar(usuario, borradorVacio.id, placeId))) {
    notFound();
  }

  return (
    <div className="grid gap-4">
      <AvisoFotosHosting />
      <p className="rounded-2xl border border-line bg-[#f8fafc] px-4 py-3 text-sm text-muted">
        Antes de crear, usá la búsqueda por matrícula en la página del lugar. Si el médico ya tiene ficha, solo agregás horario
        acá.
      </p>
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
          agendaWhatsapp: "",
          agendaPhone: "",
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