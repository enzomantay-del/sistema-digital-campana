import Link from "next/link";
import { Buscador } from "@/components/Buscador";
import { FichaProfesional } from "@/components/FichaProfesional";
import { AREAS } from "@/lib/constants";
import { filaHorario } from "@/lib/map";
import { prisma } from "@/lib/prisma";
import { armarVistaProfesional } from "@/lib/view";

export default async function Inicio() {
  const personas = await prisma.professional.findMany({
    where: { published: true, example: true },
    include: { obras: { include: { obra: true } }, attendances: { include: { place: true } } },
  });
  const destacada = personas.sort((a, b) => b.attendances.length - a.attendances.length)[0];
  const vista = destacada
    ? armarVistaProfesional({
        fullName: destacada.fullName,
        specialty: destacada.specialty,
        area: destacada.area,
        license: destacada.license,
        price: destacada.price,
        priceUpdatedAt: destacada.priceUpdatedAt,
        whatsapp: destacada.whatsapp,
        phone: destacada.phone,
        obras: destacada.obras.map((item) => item.obra.name),
        updatedAt: destacada.updatedAt,
        filas: destacada.attendances.map(filaHorario),
      })
    : null;

  return (
    <div className="grid gap-12">
      <section className="grid max-w-3xl gap-5">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Buscá quién atiende en tu zona
        </h1>
        <p className="text-xl text-muted">
          Santo Pipó, Hipólito Yrigoyen, Jardín América, Ruiz de Montoya, Puerto Rico y
          Capioví. Salud del cuerpo, salud mental y odontología.
        </p>
        <Buscador />
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {AREAS.map((area) => (
            <Link key={area.id} href={`/buscar?area=${area.id}`} className="font-semibold text-accent">
              {area.label}
            </Link>
          ))}
          <Link href="/farmacia" className="font-semibold text-accent">
            Farmacia de turno
          </Link>
        </div>
      </section>
      {vista && destacada ? (
        <section className="grid gap-4 border-t border-line pt-8">
          <h2 className="text-2xl font-semibold">Así se lee un día</h2>
          <p className="max-w-2xl text-muted">
            Una misma persona puede atender a la mañana en el hospital, a la tarde en su
            consultorio y a la noche de guardia.
          </p>
          <div className="max-w-2xl">
            <FichaProfesional vista={vista} ejemplo={destacada.example} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
