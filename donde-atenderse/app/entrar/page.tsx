import Link from "next/link";
import { salir } from "@/actions/auth";
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
      <div className="grid max-w-xl gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Ya entraste</h1>
        <p className="text-muted">
          Sesión abierta como <strong>{usuario.name}</strong> ({rol}). Podés seguir en el panel o cerrar sesión para
          entrar con otra cuenta.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={destino} className="boton w-fit">
            Ir al panel
          </Link>
          <form action={salir}>
            <button type="submit" className="boton-suave w-fit">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-6">
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
    </div>
  );
}