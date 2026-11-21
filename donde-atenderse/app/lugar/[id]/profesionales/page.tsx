import Link from "next/link";
import { notFound } from "next/navigation";
import { FichaProfesionalEnLugar } from "@/components/FichaProfesionalEnLugar";
import { LayoutFichaPublica } from "@/components/LayoutFichaPublica";
import { incluye } from "@/lib/format";
import { equipoPublicadoEnLugar } from "@/lib/lugarEquipo";
import { prisma } from "@/lib/prisma";

export default async function ProfesionalesDelLugar({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ especialidad?: string }>;
}) {
  const { id } = await params;
  const { especialidad = "" } = await searchParams;
  const lugar = await prisma.place.findUnique({ where: { id } });
  if (!lugar || !lugar.published || lugar.kind === "farmacia") notFound();
  const { profesionalesDetalle, especialidades } = await equipoPublicadoEnLugar(id);
  const lista = especialidad.trim()
    ? profesionalesDetalle.filter((persona) => incluye(persona.specialty, especialidad))
    : profesionalesDetalle;

  return (
    <LayoutFichaPublica>
      <div className="grid gap-6">
        <header className="grid gap-2">
          <Link href={`/lugar/${lugar.id}`} className="text-sm font-semibold text-link">
            Volver a {lugar.name}
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Profesionales en {lugar.name}</h1>
          <p className="text-muted">
            {lugar.locality} · {lugar.address.trim() || "Sin dirección cargada"}
            {especialidad.trim() ? ` · Filtrado: ${especialidad.trim()}` : ""}
          </p>
        </header>

        {especialidades.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/lugar/${lugar.id}/profesionales`}
              className={especialidad.trim() ? "pastilla" : "pastilla pastilla-activa"}
            >
              Todos
            </Link>
            {especialidades.map((item) => (
              <Link
                key={item}
                href={`/lugar/${lugar.id}/profesionales?especialidad=${encodeURIComponent(item)}`}
                className={incluye(item, especialidad) && especialidad.trim() ? "pastilla pastilla-activa" : "pastilla"}
              >
                {item}
              </Link>
            ))}
            <Link href={`/lugar/${lugar.id}/especialidades`} className="pastilla text-sm">
              Ver por especialidad
            </Link>
          </div>
        ) : null}

        {lista.length === 0 ? (
          <p>Todavía no hay profesionales publicados con esos datos.</p>
        ) : (
          <ul className="grid gap-2">
            {lista.map((persona) => (
              <li key={persona.id}>
                <FichaProfesionalEnLugar persona={persona} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </LayoutFichaPublica>
  );
}