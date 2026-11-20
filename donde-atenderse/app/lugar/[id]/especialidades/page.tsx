import Link from "next/link";
import { notFound } from "next/navigation";
import { equipoPublicadoEnLugar } from "@/lib/lugarEquipo";
import { prisma } from "@/lib/prisma";

export default async function EspecialidadesDelLugar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lugar = await prisma.place.findUnique({ where: { id } });
  if (!lugar || !lugar.published || lugar.kind === "farmacia") notFound();
  const { especialidades, profesionales } = await equipoPublicadoEnLugar(id);
  const conteo = new Map<string, number>();
  for (const persona of profesionales) {
    const nombre = persona.specialty.trim();
    if (!nombre) continue;
    conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1);
  }

  return (
    <div className="grid max-w-2xl gap-6">
      <header className="grid gap-2">
        <Link href={`/lugar/${lugar.id}`} className="text-sm font-semibold text-link">
          Volver a {lugar.name}
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">Especialidades en {lugar.name}</h1>
        <p className="text-muted">{lugar.locality}</p>
      </header>
      {especialidades.length === 0 ? (
        <p>Todavía no hay especialidades cargadas.</p>
      ) : (
        <ul className="grid gap-3">
          {especialidades.map((especialidad) => (
            <li key={especialidad}>
              <Link
                href={`/lugar/${lugar.id}/profesionales?especialidad=${encodeURIComponent(especialidad)}`}
                className="tarjeta flex items-center justify-between gap-3 transition hover:border-link"
              >
                <span className="text-xl font-semibold">{especialidad}</span>
                <span className="text-sm text-muted">
                  {conteo.get(especialidad) ?? 0} {(conteo.get(especialidad) ?? 0) === 1 ? "profesional" : "profesionales"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}