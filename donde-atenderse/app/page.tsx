import Link from "next/link";
import { Buscador } from "@/components/Buscador";
import { PublicidadPortada } from "@/components/PublicidadPortada";
import { PublicidadFranjaOmpuResponsive } from "@/components/PublicidadFranjaOmpuResponsive";
import { IconoCercalud, iconoArea, type NombreIconoCercalud } from "@/components/iconos/IconoCercalud";
import { mostrarDatosEjemplo } from "@/lib/config";
import { AREAS } from "@/lib/constants";
import { catalogoEspecialidades, catalogoObras } from "@/lib/search";

const BENEFICIOS: { titulo: string; texto: string; icono: NombreIconoCercalud }[] = [
  {
    titulo: "Varios pueblos, una sola guía",
    texto:
      "Incluye Santo Pipó, Hipólito Yrigoyen, Jardín América, Ruiz de Montoya, Capioví y Puerto Rico. Si en tu pueblo no aparece lo que buscás, podés ver opciones en un pueblo vecino.",
    icono: "corredor",
  },
  {
    titulo: "Insignia de verificación",
    texto:
      "El distintivo azul con tilde al lado del nombre significa que ese profesional o centro actualizó su ficha en los últimos 30 días.",
    icono: "sello",
  },
  {
    titulo: "Tres áreas en el mismo buscador",
    texto: "Salud del cuerpo, salud mental y odontología. Podés filtrar por área o buscar sin filtro.",
    icono: "areas",
  },
  {
    titulo: "Ficha con lo que necesitás",
    texto:
      "Horarios, teléfono, WhatsApp y qué obras sociales atiende (prepaga, PAMI, OSDE, IPS y las que se usan en Misiones), sin ir de un lado a otro.",
    icono: "ficha",
  },
  {
    titulo: "Vos pedís el turno",
    texto: "Cercalud no saca turnos ni reserva: muestra el contacto y le escribís directo al profesional o al centro.",
    icono: "contacto-directo",
  },
  {
    titulo: "Entrá y buscá sin cuenta",
    texto:
      "No hace falta registrarte. Escribís un nombre, elegís especialidad u obra social y ves los horarios y contactos. También están laboratorios, centros de imágenes y la farmacia de turno de cada pueblo.",
    icono: "buscar",
  },
];

const PREGUNTAS = [
  [
    "¿Qué puedo buscar en Cercalud?",
    "Profesionales, centros de salud (consultorios, hospitales, sanatorios), laboratorios e imágenes y odontología. También la farmacia de turno, en Santo Pipó, Hipólito Yrigoyen, Jardín América, Ruiz de Montoya, Capioví y Puerto Rico.",
  ],
  [
    "¿Puedo buscar por obra social?",
    "Sí. Elegís tu obra social en el buscador y ves quién la atiende. Están las que se usan en Misiones. Si una ficha no tiene tu obra social cargada, ese profesional todavía no la registró.",
  ],
  ["¿Cercalud saca turnos?", "No. Muestra los datos para que le escribas al profesional o al lugar."],
  [
    "¿Quién carga los datos?",
    "Los lugares y farmacias los carga Cercalud. Cada profesional carga su ficha y los días en que atiende; los turnos de farmacia salen del turnero oficial. La primera vez revisamos nombre, matrícula y WhatsApp.",
  ],
  ["¿Por qué pide mi ubicación?", "Para mostrar primero lo que tenés más cerca. Si no la activás, elegís el pueblo. No se guarda."],
  [
    "¿Los datos que veo son reales?",
    "Solo publicamos fichas revisadas. Cada profesional verifica su información; la insignia de verificación indica que actualizaron la ficha en los últimos 30 días.",
  ],
  [
    "¿Dónde miro la farmacia de turno?",
    "En Farmacia de turno, con día y hora de inicio y fin. Solo figura la farmacia mientras dura su turno según el turnero.",
  ],
];

function faqVisibles(demo: boolean) {
  return PREGUNTAS.map(([pregunta, respuesta]) => {
    if (demo && pregunta === "¿Los datos que veo son reales?") {
      return [
        pregunta,
        'Si aparece "Datos de ejemplo", son para probar la web. Podés ver la ficha modelo en /ejemplo/profesional.',
      ] as const;
    }
    return [pregunta, respuesta] as const;
  });
}

export default async function Inicio() {
  const [obras, especialidades] = await Promise.all([catalogoObras(), catalogoEspecialidades()]);
  const demo = mostrarDatosEjemplo();
  return (
    <div className="inicio-bandas relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 -my-8">
      <section className="bg-white">
        <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10 sm:py-16">
          <div className="grid gap-3 text-center">
            <h1 className="text-4xl font-bold tracking-[-0.04em] text-balance sm:text-5xl">
              Médicos, centros y farmacias del corredor
            </h1>
            <p className="text-lg text-muted">
              Guía de salud de Cercalud: buscá profesionales, hospitales, laboratorios y la farmacia de turno. Santo
              Pipó, Hipólito Yrigoyen, Jardín América, Ruiz de Montoya, Capioví y Puerto Rico.
            </p>
          </div>
          <Buscador obras={obras} especialidades={especialidades} />
          <div className="flex flex-wrap justify-center gap-2">
            {AREAS.map((area) => (
              <Link key={area.id} href={`/buscar?area=${area.id}`} className="pastilla enlace-icono gap-2">
                <IconoCercalud nombre={iconoArea(area.id)} size={20} className="shrink-0 text-menta" />
                {area.label}
              </Link>
            ))}
            <Link href="/farmacia" className="pastilla enlace-icono gap-2">
              <IconoCercalud nombre="farmacia" size={20} className="shrink-0 text-menta" />
              Farmacia de turno
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Publicidad" className="border-y border-line bg-white px-1 py-1 sm:py-2">
        <div className="mx-auto w-full max-w-page">
          <PublicidadPortada />
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-28 bg-[#d9e1e8]">
        <div className="mx-auto grid max-w-page gap-5 px-4 py-14 sm:py-16">
          <h2 className="text-3xl font-bold tracking-tight">Por qué buscar en Cercalud</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {BENEFICIOS.map((item) => (
              <article key={item.titulo} className="flex gap-3 border-t border-line pt-4">
                <div className="icono-beneficio">
                  <IconoCercalud nombre={item.icono} size={30} className="shrink-0" />
                </div>
                <div className="grid min-w-0 gap-1">
                  <h3 className="text-xl font-bold">{item.titulo}</h3>
                  <p className="text-muted">{item.texto}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Publicidad" className="border-t border-line bg-white px-1 py-1">
        <div className="mx-auto w-full max-w-page">
          <PublicidadFranjaOmpuResponsive
            descripcionDesktop="Banda principal en inicio: máxima visibilidad antes de las preguntas frecuentes."
            descripcionMovil="Segundo espacio en inicio (celular): mismo anunciante que la banda en PC, formato 300×250."
          />
        </div>
      </section>

      <section className="bg-[#eef1f4]">
        <div className="mx-auto grid max-w-3xl gap-2 px-4 py-14 sm:py-16">
          <h2 className="text-3xl font-bold tracking-tight">Preguntas frecuentes</h2>
          {faqVisibles(demo).map(([pregunta, respuesta]) => (
            <details key={pregunta} className="border-t border-line py-3">
              <summary className="flex cursor-pointer list-none items-start gap-2 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                <IconoCercalud nombre="guia" size={22} className="mt-0.5 shrink-0 text-menta" />
                <span>{pregunta}</span>
              </summary>
              <p className="pt-2 pl-7 text-muted">{respuesta}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}