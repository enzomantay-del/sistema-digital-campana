import Link from "next/link";
import { Marca } from "@/components/Marca";
import { usuarioActual } from "@/lib/auth";

const ENLACES = [
  { href: "/buscar", label: "Profesionales" },
  { href: "/buscar?estudios=1", label: "Estudios" },
  { href: "/farmacia", label: "Farmacia de turno" },
  { href: "/#como-funciona", label: "Cómo funciona" },
];

export async function Encabezado({ ejemplo }: { ejemplo: boolean }) {
  const usuario = await usuarioActual();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-page items-center gap-4 px-4 py-3">
        <Marca />
        <nav className="ml-4 hidden items-center gap-5 text-[15px] font-medium lg:flex">
          {ENLACES.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="text-ink hover:text-link">
              {enlace.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {ejemplo ? (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
              title="Los datos que ves ahora son de ejemplo. No son profesionales ni lugares reales."
            >
              <span className="size-2 rounded-full bg-menta" />
              Datos de ejemplo
            </span>
          ) : null}
          <Link href={usuario ? "/panel" : "/entrar"} className="whitespace-nowrap text-[15px] font-semibold hover:text-link">
            {usuario ? "Mi ficha" : "Soy profesional"}
          </Link>
        </div>
      </div>
      <nav className="mx-auto flex max-w-page gap-4 overflow-x-auto px-4 pb-3 text-sm font-medium lg:hidden">
        {ENLACES.map((enlace) => (
          <Link key={enlace.href} href={enlace.href} className="shrink-0 text-ink">
            {enlace.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
