import Link from "next/link";
import { Buscador } from "@/components/Buscador";
import { FichaProfesional } from "@/components/FichaProfesional";
import { AREAS } from "@/lib/constants";
import { filaHorario } from "@/lib/map";
import { prisma } from "@/lib/prisma";
import { armarVistaProfesional } from "@/lib/view";

const PASOS = [
  ["Buscás", "Por profesional, especialidad, lugar u obra social."],
  ["Leés la ficha", "Horario, matrícula y la fecha en que se actualizó."],
  ["Escribís", "El turno lo pedís directo. Esta web no lo reserva."],
];

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
    <div className="grid gap-14">
      <section className="mx-auto grid max-w-3xl gap-6 pt-4 text-center sm:pt-8">
        <h1 className="text-4xl font-bold tracking-[-0.04em] text-balance sm:text-5xl">
          Buscá quién atiende en tu zona
        </h1>
        <p className="text-lg text-muted">
          Santo Pipó, Hipólito Yrigoyen, Jardín América, Ruiz de Montoya, Puerto Rico y
          Capioví. Salud del cuerpo, salud mental y odontología.
        </p>
        <Buscador />
        <div className="flex flex-wrap justify-center gap-2">
          {AREAS.map((area) => (
            <Link key={area.id} href={`/buscar?area=${area.id}`} className="pastilla">
              {area.label}
            </Link>
          ))}
          <Link href="/buscar?estudios=1" className="pastilla">
            Estudios
          </Link>
          <Link href="/farmacia" className="pastilla">
            Farmacia de turno
          </Link>
        </div>
      </section>

      <section id="como-funciona" className="grid gap-4 scroll-mt-28 sm:grid-cols-3">
        {PASOS.map(([titulo, texto], indice) => (
          <article key={titulo} className="tarjeta grid gap-2">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-accent">Paso {indice + 1}</p>
            <h2 className="text-2xl font-bold tracking-tight">{titulo}</h2>
            <p className="text-muted">{texto}</p>
          </article>
        ))}
      </section>

      {vista && destacada ? (
        <section className="grid gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">Así se lee un día</h2>
            <p className="mt-2 text-muted">
              Una misma persona puede atender a la mañana en el hospital, a la tarde en su
              consultorio y a la noche de guardia.
            </p>
          </div>
          <div className="max-w-2xl">
            <FichaProfesional vista={vista} ejemplo={destacada.example} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
