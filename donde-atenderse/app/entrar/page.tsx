import type { ReactNode } from "react";
import Link from "next/link";
import { EspacioPublicitario } from "@/components/EspacioPublicitario";
import { FormularioEntrarWeb } from "@/components/FormularioEntrarWeb";
import { destinoPanelTrasLogin, esSecretaria, usuarioActual } from "@/lib/auth";
import { enlaceRecuperacionIngreso } from "@/lib/recuperacion";

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const usuario = await usuarioActual();
  if (usuario) {
    const destino = destinoPanelTrasLogin(usuario);
    const rol = esSecretaria(usuario) ? "secretaría" : usuario.role === "admin" ? "administración" : "profesional";
    return (
      <LayoutEntrarConPublicidad>
        <h1 className="text-4xl font-bold tracking-tight">Ya entraste</h1>
        <p className="text-muted">
          Sesión abierta como <strong>{usuario.name}</strong> ({rol}). Podés seguir en el panel o cerrar sesión para
          entrar con otra cuenta.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={destino} className="boton w-fit">
            Ir al panel
          </Link>
          <form method="POST" action="/api/salir">
            <button type="submit" className="boton-suave w-fit">
              Cerrar sesión
            </button>
          </form>
        </div>
      </LayoutEntrarConPublicidad>
    );
  }
  return (
    <LayoutEntrarConPublicidad>
      <h1 className="text-4xl font-bold tracking-tight">Entrar</h1>
      <p className="max-w-xl text-muted">
        Ingreso para administración, secretarías y profesionales con cuenta asignada por Cercalud.
      </p>
      <FormularioEntrarWeb error={error} recuperacionHref={enlaceRecuperacionIngreso()} />
      <p className="flex flex-wrap gap-x-4 gap-y-2">
        <Link href="/crear-cuenta" className="text-sm text-muted">
          ¿Necesitás cuenta? Pedila a la administración
        </Link>
        <a
          href={enlaceRecuperacionIngreso()}
          className="font-semibold text-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Olvidé mis datos — WhatsApp
        </a>
      </p>
    </LayoutEntrarConPublicidad>
  );
}

function LayoutEntrarConPublicidad({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-start lg:gap-10">
      <div className="grid min-w-0 gap-6">{children}</div>
      <aside className="lg:sticky lg:top-24">
        <div className="hidden lg:block">
          <EspacioPublicitario
            formato="skyscraper"
            descripcion="Columna lateral en ingreso de profesionales y secretarías."
          />
        </div>
        <div className="lg:hidden">
          <EspacioPublicitario formato="banner" anchoFila descripcion="Franja en la página de ingreso." />
        </div>
      </aside>
    </div>
  );
}