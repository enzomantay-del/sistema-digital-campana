import Link from "next/link";
import { Marca } from "@/components/Marca";
import { RUTA_PROFESIONAL_EJEMPLO } from "@/lib/ejemplo";

export function Pie({ ejemplo }: { ejemplo: boolean }) {
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="mx-auto grid max-w-page gap-6 px-4 py-10">
        <Marca oficial />
        <p className="max-w-3xl text-base leading-relaxed text-muted">
          Cercalud es el directorio privado de información de salud de Jardín América y la zona.
          Los lugares los carga Cercalud; cada profesional mantiene su ficha. No da ni gestiona turnos:
          te mostramos los datos y el turno lo pedís directo por WhatsApp. No reemplaza una consulta.
        </p>
        {ejemplo ? (
          <p className="max-w-3xl text-base text-ink">
            Los datos que ves ahora son de ejemplo, para probar la web. No son profesionales ni
            lugares reales de la zona.{" "}
            <Link href={RUTA_PROFESIONAL_EJEMPLO} className="font-semibold text-link">
              Ver ficha de ejemplo
            </Link>
            .
          </p>
        ) : null}
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-link">
          <Link href="/">Inicio</Link>
          <Link href="/buscar">Profesionales</Link>
          <Link href="/buscar?estudios=1">Estudios</Link>
          <Link href="/farmacia">Farmacia de turno</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/terminos">Términos</Link>
          <Link href="/entrar">Soy profesional</Link>
        </nav>
      </div>
    </footer>
  );
}
