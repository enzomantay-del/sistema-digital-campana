import Link from "next/link";

export default function PaginaPrivacidad() {
  return (
    <article className="mx-auto grid max-w-2xl gap-6">
      <header className="grid gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Privacidad</h1>
        <p className="text-sm text-muted">Última actualización: noviembre de 2026</p>
      </header>
      <div className="grid gap-4 text-ink">
        <section className="grid gap-2">
          <h2 className="text-xl font-bold">Qué es Cercalud</h2>
          <p className="text-muted">
            Cercalud publica datos de contacto, horarios y obras sociales que cargan los profesionales y los lugares de
            salud, para que las personas puedan buscar atención en su zona. No es un servicio de emergencias ni de
            telemedicina.
          </p>
        </section>
        <section className="grid gap-2">
          <h2 className="text-xl font-bold">Datos que recopilamos</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            <li>Datos de cuenta de profesionales (correo, nombre, contraseña cifrada).</li>
            <li>Información de fichas publicadas (nombre profesional, matrícula, teléfonos, horarios, fotos).</li>
            <li>
              Ubicación del navegador, solo si la activás para ordenar resultados cercanos; no se guarda en nuestros
              servidores de forma persistente para visitantes sin cuenta.
            </li>
          </ul>
        </section>
        <section className="grid gap-2">
          <h2 className="text-xl font-bold">Uso de la información</h2>
          <p className="text-muted">
            Usamos los datos para mostrar el directorio, revisar fichas nuevas y mantener la seguridad del sitio. No
            vendemos datos personales de pacientes: el paciente no necesita cuenta para buscar.
          </p>
        </section>
        <section className="grid gap-2">
          <h2 className="text-xl font-bold">Tus derechos</h2>
          <p className="text-muted">
            Si sos profesional podés corregir tu ficha desde el panel. Para baja o consultas sobre datos publicados,
            escribinos desde la página de{" "}
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