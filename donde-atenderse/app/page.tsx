import Link from "next/link";
import { Buscador } from "@/components/Buscador";
import { AREAS } from "@/lib/constants";
import { catalogoObras } from "@/lib/search";

const BENEFICIOS = [
  ["El corredor entero", "Si en tu pueblo no está esa atención, ves el pueblo de al lado."],
  ["Con fecha", "Cada ficha dice quién la cargó y cuándo se actualizó."],
  ["Tres áreas juntas", "Salud del cuerpo, salud mental y odontología, en la misma búsqueda."],
  ["Sin turno desde acá", "Escribís directo al profesional o al lugar. Cercalud no reserva."],
];

const PREGUNTAS = [
  ["¿Cercalud saca turnos?", "No. Muestra los datos para que le escribas al profesional o al lugar."],
  ["¿Es de la municipalidad o de la provincia?", "No. Es un directorio privado. No reemplaza una consulta."],
  ["¿Por qué pide mi ubicación?", "Para mostrar primero lo que tenés más cerca. Si no la activás, elegís el pueblo. No se guarda."],
  ["¿Qué obras sociales figuran?", "Las que se usan en Misiones. Si una ficha no tiene la tuya, ese profesional todavía no la cargó."],
  ["¿Los datos que veo son reales?", "Si aparece “Datos de ejemplo”, son para probar la web. No son profesionales ni lugares de la zona."],
  ["¿Dónde miro la farmacia de turno?", "En su página, con la fecha que cargaron. Si esa fecha ya pasó, no es el turno de hoy."],
];

export default async function Inicio() {
  const obras = await catalogoObras();
  return (
    <div className="grid gap-16">
      <section className="mx-auto grid max-w-3xl gap-6 pt-4 sm:pt-10">
        <div className="grid gap-3 text-center">
          <h1 className="text-4xl font-bold tracking-[-0.04em] text-balance sm:text-5xl">
            Buscá quién atiende en tu zona
          </h1>
          <p className="text-lg text-muted">
            Santo Pipó, Hipólito Yrigoyen, Jardín América, Ruiz de Montoya, Puerto Rico y Capioví.
          </p>
        </div>
        <Buscador obras={obras} />
        <div className="flex flex-wrap justify-center gap-2">
          {AREAS.map((area) => (
            <Link key={area.id} href={`/buscar?area=${area.id}`} className="pastilla">
              {area.label}
            </Link>
          ))}
          <Link href="/farmacia" className="pastilla">
            Farmacia de turno
          </Link>
        </div>
      </section>

      <section id="como-funciona" className="grid scroll-mt-28 gap-5">
        <h2 className="text-3xl font-bold tracking-tight">Por qué buscar en Cercalud</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFICIOS.map(([titulo, texto]) => (
            <article key={titulo} className="grid gap-1 border-t border-line pt-4">
              <h3 className="text-xl font-bold">{titulo}</h3>
              <p className="text-muted">{texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid max-w-3xl gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Preguntas frecuentes</h2>
        {PREGUNTAS.map(([pregunta, respuesta]) => (
          <details key={pregunta} className="border-t border-line py-3">
            <summary className="cursor-pointer text-lg font-semibold">{pregunta}</summary>
            <p className="pt-2 text-muted">{respuesta}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
