import Link from "next/link";
import { notFound } from "next/navigation";
import { etiquetaArea, incluye } from "@/lib/format";
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
  const { profesionales } = await equipoPublicadoEnLugar(id);
  const lista = especialidad.trim()
    ? profesionales.filter((persona) => incluye(persona.specialty, especialidad))
    : profesionales;

  return (
    <div className="grid max-w-2xl gap-6">
      <header className="grid gap-2">
        <Link href={`/lugar/${lugar.id}`} className="text-sm font-semibold text-link">
          Volver a {lugar.name}
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">Profesionales en {lugar.name}</h1>
        <p className="text-muted">
          {lugar.locality}
          {especialidad.trim() ? ` · Solo ${especialidad.trim()}` : ""}
        </p>
      </header>
      {lista.length === 0 ? (
        <p>Todavía no hay profesionales publicados con esos datos.</p>
      ) : (
        <ul className="grid gap-3">
          {lista.map((persona) => (
            <li key={persona.id}>
              <Link href={`/profesional/${persona.id}`} className="tarjeta block transition hover:border-link">
                <h2 className="text-2xl font-bold tracking-tight">{persona.fullName}</h2>
                <p className="text-muted">
                  {persona.specialty.trim() || "Especialidad sin cargar"} · {etiquetaArea(persona.area)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}