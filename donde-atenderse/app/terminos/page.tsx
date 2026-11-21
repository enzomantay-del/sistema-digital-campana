import Link from "next/link";

export default function PaginaTerminos() {
  return (
    <article className="mx-auto grid max-w-2xl gap-6">
      <header className="grid gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Términos de uso</h1>
        <p className="text-sm text-muted">Última actualización: noviembre de 2026</p>
      </header>
      <div className="grid gap-4 text-ink">
        <section className="grid gap-2">
          <h2 className="text-xl font-bold">Uso del sitio</h2>
          <p className="text-muted">
            Cercalud muestra información declarada por profesionales y lugares. La precisión depende de quien carga y
            actualiza cada ficha. Verificamos matrícula y contacto en la primera publicación, pero no sustituimos el
            criterio médico ni la relación entre paciente y profesional.
          </p>
        </section>
        <section className="grid gap-2">
          <h2 className="text-xl font-bold">Turnos y urgencias</h2>
          <p className="text-muted">
            Cercalud no reserva turnos. Ante una urgencia, usá los servicios de emergencia habituales (107, guardia del
            hospital más cercano, etc.).
          </p>
        </section>
        <section className="grid gap-2">
          <h2 className="text-xl font-bold">Contenido publicado</h2>
          <p className="text-muted">
            Podemos retirar o corregir fichas que incumplan estas condiciones, contengan datos falsos o afecten la
            confianza del directorio. Los espacios publicitarios son comerciales y se identifican como publicidad.
          </p>
        </section>
        <section className="grid gap-2">
          <h2 className="text-xl font-bold">Contacto</h2>
          <p className="text-muted">
            Consultas legales o sobre una ficha:{" "}
            <Link href="/contacto" className="font-semibold text-link hover:underline">
              contacto
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}