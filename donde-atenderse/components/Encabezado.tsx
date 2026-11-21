import Link from "next/link";
import { IconoCercalud, ICONO_NAV } from "@/components/iconos/IconoCercalud";
import { Marca } from "@/components/Marca";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { mostrarDatosEjemplo } from "@/lib/config";
import { RUTA_PROFESIONAL_EJEMPLO } from "@/lib/ejemplo";

const ENLACES = [
  { href: "/buscar", label: "Profesionales" },
  { href: "/buscar?estudios=1", label: "Estudios" },
  { href: "/farmacia", label: "Farmacia de turno" },
  { href: "/#como-funciona", label: "Cómo funciona" },
] as const;

export async function Encabezado({ ejemplo }: { ejemplo: boolean }) {
  let usuario = null;
  try {
    usuario = await usuarioActual();
  } catch {
    usuario = null;
  }
  const admin = esAdmin(usuario);
  const demo = mostrarDatosEjemplo();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-page items-center gap-4 px-4 py-3">
        <Marca />
        <nav className="ml-4 hidden items-center gap-5 text-[15px] font-medium lg:flex">
          {ENLACES.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="enlace-icono text-ink hover:text-link">
              <IconoCercalud nombre={ICONO_NAV[enlace.href]} size={22} className="shrink-0 text-menta" />
              {enlace.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {demo && ejemplo ? (
            <Link
              href={RUTA_PROFESIONAL_EJEMPLO}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] hover:border-menta"
              title="Ver la ficha de profesional de ejemplo (foto, horarios y contacto)."
            >
              <IconoCercalud nombre="ficha" size={16} className="shrink-0 text-menta" />
              Ver ficha de ejemplo
            </Link>
          ) : null}
          <Link
            href={usuario ? (admin ? "/panel/admin" : "/panel") : "/entrar"}
            className="whitespace-nowrap text-[15px] font-semibold hover:text-link"
          >
            {usuario ? (admin ? "Administración" : "Mi ficha") : "Soy profesional"}
          </Link>
        </div>
      </div>
      <nav className="mx-auto flex max-w-page gap-4 overflow-x-auto px-4 pb-3 text-sm font-medium lg:hidden">
        {ENLACES.map((enlace) => (
          <Link key={enlace.href} href={enlace.href} className="enlace-icono shrink-0 text-ink">
            <IconoCercalud nombre={ICONO_NAV[enlace.href]} size={20} className="shrink-0 text-menta" />
            {enlace.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
