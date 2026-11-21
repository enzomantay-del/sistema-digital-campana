import Link from "next/link";
import { notFound } from "next/navigation";
import { FichaProfesionalEnLugar } from "@/components/FichaProfesionalEnLugar";
import { LayoutFichaPublica } from "@/components/LayoutFichaPublica";
import { agruparPorEspecialidad, equipoPublicadoEnLugar } from "@/lib/lugarEquipo";
import { prisma } from "@/lib/prisma";

export default async function EspecialidadesDelLugar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lugar = await prisma.place.findUnique({ where: { id } });
  if (!lugar || !lugar.published || lugar.kind === "farmacia") notFound();
  const { profesionalesDetalle, cantidad } = await equipoPublicadoEnLugar(id);
  const grupos = agruparPorEspecialidad(profesionalesDetalle);

  return (
    <LayoutFichaPublica>
      <div className="grid gap-6">
        <header className="grid gap-2">
          <Link href={`/lugar/${lugar.id}`} className="text-sm font-semibold text-link">
            Volver a {lugar.name}
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Especialidades en {lugar.name}</h1>
          <p className="text-muted">
            {lugar.locality} · {cantidad} {cantidad === 1 ? "profesional publicado" : "profesionales publicados"}
          </p>
        </header>

        {grupos.length === 0 ? (
          <p>Todavía no hay especialidades cargadas.</p>
        ) : (
          <div className="grid gap-8">
            {grupos.map(([especialidad, profesionales]) => (
              <section key={especialidad} className="grid gap-4">
                <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line pb-2">
                  <h2 className="text-2xl font-bold">{especialidad}</h2>
                  <Link
                    href={`/lugar/${lugar.id}/profesionales?especialidad=${encodeURIComponent(especialidad)}`}
                    className="text-sm font-semibold text-link"
                  >
                    {profesionales.length === 1 ? "Ver 1 profesional" : `Ver los ${profesionales.length} profesionales`}
                  </Link>
                </div>
                <ul className="grid gap-3">
                  {profesionales.map((persona) => (
                    <li key={persona.id}>
                      <FichaProfesionalEnLugar persona={persona} compacto />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <Link href={`/lugar/${lugar.id}/profesionales`} className="boton-suave w-fit">
          Ver listado completo de profesionales
        </Link>
      </div>
    </LayoutFichaPublica>
  );
}