import Link from "next/link";
import { salir } from "@/actions/auth";
import { destinoPanelTrasLogin, esAdmin, esProfesional, esSecretaria } from "@/lib/auth";

type UsuarioBarra = {
  name: string;
  role: string;
};

export function PanelBarraSesion({ usuario }: { usuario: UsuarioBarra }) {
  const rol = esAdmin(usuario)
    ? "Administración"
    : esSecretaria(usuario)
      ? "Secretaría"
      : esProfesional(usuario)
        ? "Profesional"
        : "Cuenta";
  const panelHref = destinoPanelTrasLogin(usuario);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-[#f8fafc] px-4 py-2.5 text-sm">
      <p className="text-muted">
        Sesión: <span className="font-semibold text-ink">{usuario.name || "Sin nombre"}</span>
        <span className="hidden sm:inline"> · {rol}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={panelHref} className="font-semibold text-link hover:underline">
          Ir al panel
        </Link>
        <span className="text-line" aria-hidden>
          |
        </span>
        <Link href="/" className="font-semibold text-muted hover:text-ink">
          Sitio público
        </Link>
        <form action={salir}>
          <button type="submit" className="boton-suave px-3 py-1.5 text-sm">
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}