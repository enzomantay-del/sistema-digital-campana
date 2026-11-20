import Link from "next/link";
import { salir } from "@/actions/auth";
import {
  bajarLugar,
  bajarProfesional,
  eliminarLugar,
  eliminarProfesional,
  publicarLugar,
  publicarProfesional,
} from "@/actions/admin";
import { AccionesAdmin } from "@/components/AccionesAdmin";
import { requiereAdmin } from "@/lib/auth";
import { etiquetaArea, etiquetaLugar, fecha } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function PanelAdmin() {
  const admin = await requiereAdmin();
  const [profesionalesPendientes, lugaresSugeridos, profesionales, lugares] = await Promise.all([
    prisma.professional.findMany({
      where: { reviewed: false },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.place.findMany({
      where: { published: false, suggestedById: { not: null } },
      include: { suggestedBy: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.professional.findMany({
      include: { user: true },
      orderBy: [{ published: "desc" }, { fullName: "asc" }],
    }),
    prisma.place.findMany({
      orderBy: [{ published: "desc" }, { locality: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="grid gap-12">
      <header className="grid max-w-3xl gap-3">
        <h1 className="text-4xl font-bold tracking-tight">Administración</h1>
        <p className="text-muted">
          Hola, {admin.name}. Acá publicás, bajás o eliminás lugares y fichas, y revisás lo que entra nuevo.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/panel/lugar/nuevo" className="boton">
            Cargar un lugar
          </Link>
          <form action={salir}>
            <button className="boton-suave" type="submit">
              Salir
            </button>
          </form>
        </div>
      </header>

      <section className="grid gap-4">
        <h2 className="text-2xl font-semibold">Fichas a revisar</h2>
        {profesionalesPendientes.length === 0 ? (
          <p className="text-muted">No hay fichas pendientes.</p>
        ) : (
          <ul className="grid gap-4">
            {profesionalesPendientes.map((persona) => (
              <li key={persona.id} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="grid gap-1">
                  <p className="font-semibold">{persona.fullName}</p>
                  <p className="text-muted">
                    {persona.specialty || "Sin especialidad"} · {etiquetaArea(persona.area)}
                    {persona.license ? ` · Mat. ${persona.license}` : ""}
                    {persona.example ? " · Dato de ejemplo" : ""}
                  </p>
                  <p className="text-muted">
                    WhatsApp: {persona.whatsapp || "—"} · {persona.user?.email ?? "Sin cuenta"}
                  </p>
                  <p className="text-sm text-muted">Cargada el {fecha(persona.createdAt)}</p>
                </div>
                <AccionesAdmin
                  acciones={[
                    { label: "Publicar", action: publicarProfesional, id: persona.id, tono: "boton" },
                    { label: "Bajar", action: bajarProfesional, id: persona.id, tono: "suave" },
                    {
                      label: "Eliminar",
                      action: eliminarProfesional,
                      id: persona.id,
                      tono: "peligro",
                      confirmar: `¿Eliminar la ficha de ${persona.fullName}? No se puede deshacer.`,
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="text-2xl font-semibold">Lugares sugeridos</h2>
        {lugaresSugeridos.length === 0 ? (
          <p className="text-muted">No hay sugerencias pendientes.</p>
        ) : (
          <ul className="grid gap-4">
            {lugaresSugeridos.map((lugar) => (
              <li key={lugar.id} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="grid gap-1">
                  <p className="font-semibold">{lugar.name}</p>
                  <p className="text-muted">
                    {etiquetaLugar(lugar.kind)} · {lugar.locality}
                    {lugar.address ? ` · ${lugar.address}` : ""}
                  </p>
                  <p className="text-muted">
                    Sugerido por {lugar.suggestedBy?.name ?? "alguien"}
                    {lugar.suggestedBy?.email ? ` (${lugar.suggestedBy.email})` : ""}
                  </p>
                </div>
                <AccionesAdmin
                  extra={
                    <Link href={`/panel/lugar/${lugar.id}`} className="font-semibold text-link">
                      Editar
                    </Link>
                  }
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="text-2xl font-semibold">Profesionales</h2>
        {profesionales.length === 0 ? (
          <p className="text-muted">Todavía no hay fichas.</p>
        ) : (
          <ul className="grid gap-3">
            {profesionales.map((persona) => (
              <li key={persona.id} className="grid gap-3 border-t border-line pt-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold">{persona.fullName}</p>
                  <p className="text-sm text-muted">
                    {persona.specialty || "Sin especialidad"} · {etiquetaArea(persona.area)} ·{" "}
                    {persona.published ? "Publicada" : "Sin publicar"}
                    {persona.reviewed ? "" : " · Sin revisar"}
                    {persona.example ? " · Dato de ejemplo" : ""}
                    {persona.user?.email ? ` · ${persona.user.email}` : ""}
                  </p>
                </div>
                <AccionesAdmin
                  acciones={[
                    { label: "Publicar", action: publicarProfesional, id: persona.id },
                    { label: "Bajar", action: bajarProfesional, id: persona.id },
                    {
                      label: "Eliminar",
                      action: eliminarProfesional,
                      id: persona.id,
                      tono: "peligro",
                      confirmar: `¿Eliminar la ficha de ${persona.fullName}? No se puede deshacer.`,
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-semibold">Lugares</h2>
          <Link href="/panel/lugar/nuevo" className="font-semibold text-link">
            Cargar otro
          </Link>
        </div>
        {lugares.length === 0 ? (
          <p className="text-muted">Todavía no hay lugares. Empezá por cargar los del corredor.</p>
        ) : (
          <ul className="grid gap-3">
            {lugares.map((lugar) => (
              <li key={lugar.id} className="grid gap-3 border-t border-line pt-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <Link href={`/panel/lugar/${lugar.id}`} className="font-semibold hover:text-link">
                    {lugar.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {etiquetaLugar(lugar.kind)} · {lugar.locality} · {lugar.published ? "Publicado" : "Sin publicar"}
                    {lugar.example ? " · Dato de ejemplo" : ""}
                  </p>
                </div>
                <AccionesAdmin
                  extra={
                    <Link href={`/panel/lugar/${lugar.id}`} className="font-semibold text-link">
                      Editar
                    </Link>
                  }
                  acciones={[
                    { label: "Publicar", action: publicarLugar, id: lugar.id },
                    { label: "Bajar", action: bajarLugar, id: lugar.id },
                    {
                      label: "Eliminar",
                      action: eliminarLugar,
                      id: lugar.id,
                      tono: "peligro",
                      confirmar: `¿Eliminar ${lugar.name}? No se puede deshacer.`,
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
