import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorProfesional } from "@/components/EditorProfesional";
import { AccionesAdmin } from "@/components/AccionesAdmin";
import { bajarProfesional, eliminarProfesional, publicarProfesional } from "@/actions/admin";
import { requiereAdmin } from "@/lib/auth";
import { horarioProfesional } from "@/lib/map";
import { prisma } from "@/lib/prisma";
import { catalogoObras } from "@/lib/search";

export default async function EditarProfesionalAdmin({ params }: { params: Promise<{ id: string }> }) {
  await requiereAdmin();
  const { id } = await params;
  const persona = await prisma.professional.findUnique({
    where: { id },
    include: {
      obras: { include: { obra: true } },
      attendances: { include: { place: true } },
      user: true,
    },
  });
  if (!persona) notFound();

  const [lugares, obras] = await Promise.all([
    prisma.place.findMany({
      where: { published: true, kind: { not: "farmacia" } },
      select: { id: true, name: true, locality: true, kind: true },
      orderBy: [{ locality: "asc" }, { name: "asc" }],
    }),
    catalogoObras(),
  ]);

  return (
    <div className="panel-admin mx-auto grid w-full max-w-5xl gap-6">
      <section className="grid gap-3 rounded-2xl border border-line bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/panel/admin" className="font-semibold text-link">
            Volver al panel
          </Link>
          <span className="text-sm text-muted">
            {persona.published ? "Publicada" : "Sin publicar"}
            {persona.example ? " · Dato de ejemplo" : ""}
            {persona.user ? ` · Cuenta ${persona.user.email}` : " · Sin cuenta vinculada"}
          </span>
        </div>
        <AccionesAdmin
          compacto
          acciones={[
            { label: "Publicar", action: publicarProfesional, id: persona.id, tono: "boton" },
            { label: "Bajar", action: bajarProfesional, id: persona.id, tono: "suave" },
            {
              label: "Eliminar",
              action: eliminarProfesional,
              id: persona.id,
              tono: "peligro",
              confirmar: `¿Eliminar ${persona.fullName}? No se puede deshacer.`,
            },
          ]}
        />
        {persona.example ? (
          <p className="text-sm text-muted">
            Podés editar esta ficha de ejemplo como administrador. Sigue marcada como dato de ejemplo hasta que la
            conviertas en ficha real (sin cuenta) o la reemplacés por un profesional registrado.
          </p>
        ) : null}
      </section>
      <EditorProfesional
        modoAdmin
        professionalId={persona.id}
        ejemplo={persona.example}
        obras={obras}
        lugares={lugares}
        revisada={persona.reviewed}
        publicada={persona.published}
        inicial={{
          fullName: persona.fullName,
          license: persona.license,
          area: persona.area,
          specialty: persona.specialty,
          photoUrl: persona.photoUrl,
          whatsapp: persona.whatsapp,
          phone: persona.phone,
          price: persona.price,
          priceUpdatedAt: persona.priceUpdatedAt ? persona.priceUpdatedAt.toISOString() : null,
          obras: persona.obras.map((item) => item.obra.name),
          otraObra: "",
          horarios: persona.attendances.map((item) => horarioProfesional(item, false)),
        }}
      />
    </div>
  );
}