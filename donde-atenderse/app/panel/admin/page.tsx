import Link from "next/link";
import { salir } from "@/actions/auth";
import {
  bajarLugar,
  bajarProfesional,
  publicarLugar,
  publicarProfesional,
  rechazarSugerencia,
} from "@/actions/admin";
import { requiereAdmin } from "@/lib/auth";
import { etiquetaArea, etiquetaLugar, fecha } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function PanelAdmin() {
  const admin = await requiereAdmin();
  const [profesionalesPendientes, lugaresSugeridos, profesionales, lugares] = await Promise.all([
    prisma.professional.findMany({
      where: { reviewed: false, example: false },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.place.findMany({
      where: { published: false, suggestedById: { not: null } },
      include: { suggestedBy: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.professional.findMany({
      where: { example: false },
      include: { user: true },
      orderBy: { fullName: "asc" },
      take: 40,
    }),
    prisma.place.findMany({
      where: { example: false },
      orderBy: [{ locality: "asc" }, { name: "asc" }],
      take: 60,
    }),
  ]);

  return (
    <div className="grid gap-12">
      <header className="grid max-w-3xl gap-3">
        <h1 className="text-4xl font-bold tracking-tight">Administración</h1>
        <p className="text-muted">
          Hola, {admin.name}. Acá publicás lugares, revisás la primera ficha de cada profesional y bajás datos que no
          correspondan.
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
                  </p>
                  <p className="text-muted">
                    WhatsApp: {persona.whatsapp || "—"} · {persona.user?.email ?? "Sin cuenta"}
                  </p>
                  <p className="text-sm text-muted">Cargada el {fecha(persona.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={publicarProfesional}>
                    <input type="hidden" name="id" value={persona.id} />
                    <button className="boton" type="submit">
                      Publicar
                    </button>
                  </form>
                  <form action={bajarProfesional}>
                    <input type="hidden" name="id" value={persona.id} />
                    <button className="boton-suave" type="submit">
                      Dejar sin publicar
                    </button>
                  </form>
                </div>
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
                <div className="flex flex-wrap gap-2">
                  <Link href={`/panel/lugar/${lugar.id}`} className="boton-suave">
                    Editar
                  </Link>
                  <form action={publicarLugar}>
                    <input type="hidden" name="id" value={lugar.id} />
                    <button className="boton" type="submit">
                      Publicar
                    </button>
                  </form>
                  <form action={rechazarSugerencia}>
                    <input type="hidden" name="id" value={lugar.id} />
                    <button className="boton-suave" type="submit">
                      Descartar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="text-2xl font-semibold">Profesionales</h2>
        {profesionales.length === 0 ? (
          <p className="text-muted">Todavía no hay fichas reales.</p>
        ) : (
          <ul className="grid gap-3">
            {profesionales.map((persona) => (
              <li key={persona.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <div>
                  <p className="font-semibold">{persona.fullName}</p>
                  <p className="text-sm text-muted">
                    {persona.published ? "Publicada" : "Sin publicar"}
                    {persona.reviewed ? "" : " · Sin revisar"}
                    {persona.user?.email ? ` · ${persona.user.email}` : ""}
                  </p>
                </div>
                {persona.published ? (
                  <form action={bajarProfesional}>
                    <input type="hidden" name="id" value={persona.id} />
                    <button className="font-semibold text-link" type="submit">
                      Bajar
                    </button>
                  </form>
                ) : (
                  <form action={publicarProfesional}>
                    <input type="hidden" name="id" value={persona.id} />
                    <button className="font-semibold text-link" type="submit">
                      Publicar
                    </button>
                  </form>
                )}
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
          <p className="text-muted">Todavía no hay lugares reales. Empezá por cargar los del corredor.</p>
        ) : (
          <ul className="grid gap-3">
            {lugares.map((lugar) => (
              <li key={lugar.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <div>
                  <Link href={`/panel/lugar/${lugar.id}`} className="font-semibold hover:text-link">
                    {lugar.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {etiquetaLugar(lugar.kind)} · {lugar.locality} · {lugar.published ? "Publicado" : "Sin publicar"}
                  </p>
                </div>
                {lugar.published ? (
                  <form action={bajarLugar}>
                    <input type="hidden" name="id" value={lugar.id} />
                    <button className="font-semibold text-link" type="submit">
                      Bajar
                    </button>
                  </form>
                ) : (
                  <form action={publicarLugar}>
                    <input type="hidden" name="id" value={lugar.id} />
                    <button className="font-semibold text-link" type="submit">
                      Publicar
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
