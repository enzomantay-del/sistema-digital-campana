import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BuscarMatriculaProfesional } from "@/components/BuscarMatriculaProfesional";
import { EspecialidadesLugarEditor } from "@/components/EspecialidadesLugarEditor";
import { esSecretaria, usuarioActual } from "@/lib/auth";
import { especialidadesDesdeCampo } from "@/lib/especialidades";
import { prisma } from "@/lib/prisma";

export default async function CargasPorLugar({ params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  if (!esSecretaria(usuario)) redirect("/panel");
  if (!usuario.places.some((item) => item.placeId === placeId)) notFound();

  const lugar = await prisma.place.findUnique({ where: { id: placeId } });
  if (!lugar) notFound();

  const enEsteLugar = await prisma.attendance.findMany({
    where: { placeId },
    include: { professional: true },
    orderBy: { professional: { fullName: "asc" } },
  });

  return (
    <div className="grid max-w-2xl gap-8">
      <header className="grid gap-2">
        <Link href="/panel/cargas" className="w-fit font-semibold text-link">
          ← Volver a lugares
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{lugar.name}</h1>
        <p className="text-muted">{lugar.locality} · Cargá fichas y horarios de los profesionales que atienden acá.</p>
      </header>

      <EspecialidadesLugarEditor placeId={placeId} iniciales={especialidadesDesdeCampo(lugar.specialties)} />

      <BuscarMatriculaProfesional placeId={placeId} />

      <Link href={`/panel/cargas/${placeId}/nuevo`} className="boton w-fit">
        Nuevo profesional (primera vez en Cercalud)
      </Link>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Profesionales con horario en este lugar</h2>
        {enEsteLugar.length === 0 ? (
          <p className="text-muted">Todavía no hay profesionales cargados para este lugar.</p>
        ) : (
          <ul className="grid gap-2">
            {enEsteLugar.map((fila) => (
              <li key={fila.id}>
                <Link
                  href={`/panel/cargas/${placeId}/${fila.professionalId}`}
                  className="block rounded-2xl border border-line px-4 py-3 hover:bg-[#f8fafc]"
                >
                  <span className="font-semibold">{fila.professional.fullName}</span>
                  <span className="text-muted">
                    {fila.professional.license ? ` · Mat. ${fila.professional.license}` : ""}
                    {fila.professional.published ? " · Publicado" : " · Pendiente de aprobación"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}