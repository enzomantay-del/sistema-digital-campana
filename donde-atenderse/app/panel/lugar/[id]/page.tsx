import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asignarEditor, bajarLugar, eliminarLugar, publicarLugar, quitarEditor } from "@/actions/admin";
import { AccionesAdmin } from "@/components/AccionesAdmin";
import { EditorLugar } from "@/components/EditorLugar";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { fechaInput } from "@/lib/format";
import { horarioLugar } from "@/lib/map";
import { prisma } from "@/lib/prisma";
import { catalogoObras } from "@/lib/search";

export default async function PaginaEditorLugar({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  const admin = esAdmin(usuario);
  if (!admin && !usuario.places.some((item) => item.placeId === id)) notFound();

  const lugar = await prisma.place.findUnique({
    where: { id },
    include: {
      obras: { include: { obra: true } },
      studies: true,
      attendances: { include: { professional: true } },
      duties: { orderBy: { endsOn: "desc" }, take: 1 },
      editors: { include: { user: true } },
      suggestedBy: true,
    },
  });
  if (!lugar) notFound();
  const obras = await catalogoObras();
  const turno = lugar.duties[0];

  return (
    <div className="grid gap-8">
      {admin ? (
        <section className="grid max-w-3xl gap-4 rounded-3xl border border-line bg-white p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/panel/admin" className="font-semibold text-link">
              Volver al panel
            </Link>
            <span className="text-muted">
              {lugar.published ? "Publicado" : "Sin publicar"}
              {lugar.suggestedBy ? ` · Sugerido por ${lugar.suggestedBy.name}` : ""}
            </span>
          </div>
          <AccionesAdmin
            acciones={[
              { label: "Publicar", action: publicarLugar, id: lugar.id, tono: "boton" },
              { label: "Bajar", action: bajarLugar, id: lugar.id, tono: "suave" },
              {
                label: "Eliminar",
                action: eliminarLugar,
                id: lugar.id,
                tono: "peligro",
                confirmar: `¿Eliminar ${lugar.name}? No se puede deshacer.`,
              },
            ]}
          />
          <form action={asignarEditor} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-1">
              Asignar editor por correo
              <input name="email" type="email" className="campo" placeholder="secretaria@ejemplo.com" required />
            </label>
            <input type="hidden" name="placeId" value={lugar.id} />
            <button className="boton-suave" type="submit">
              Asignar
            </button>
          </form>
          {error === "correo" ? <p className="text-warn">No hay una cuenta con ese correo.</p> : null}
          {lugar.editors.length > 0 ? (
            <ul className="grid gap-2">
              {lugar.editors.map((editor) => (
                <li key={editor.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <span>
                    {editor.user.name} · {editor.user.email}
                  </span>
                  <form action={quitarEditor}>
                    <input type="hidden" name="placeId" value={lugar.id} />
                    <input type="hidden" name="userId" value={editor.userId} />
                    <button className="font-semibold text-link" type="submit">
                      Quitar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
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
    </div>
  );
}
