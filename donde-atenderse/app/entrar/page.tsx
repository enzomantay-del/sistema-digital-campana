import Link from "next/link";
import { esAdmin, usuarioActual } from "@/lib/auth";

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const usuario = await usuarioActual();
  if (usuario) {
    const destino = esAdmin(usuario) ? "/panel/admin" : "/panel";
    return (
      <div className="grid max-w-xl gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Ya entraste</h1>
        <p className="text-muted">Sesión abierta como {usuario.name}.</p>
        <Link href={destino} className="boton w-fit">
          Ir al panel
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-6">
      <h1 className="text-4xl font-bold tracking-tight">Entrar</h1>
      <p className="max-w-xl text-muted">
        Desde acá cargás tu ficha. El paciente no necesita una cuenta para buscar.
      </p>
      <form method="POST" action="/api/login" className="grid max-w-xl gap-4">
        <label className="grid gap-1">
          Correo
          <input name="email" type="email" className="campo" autoComplete="email" required />
        </label>
        <label className="grid gap-1">
          Contraseña
          <input name="password" type="password" className="campo" autoComplete="current-password" required />
        </label>
        {error ? <p className="text-warn">{error}</p> : null}
        <button className="boton w-fit" type="submit">
          Entrar
        </button>
      </form>
      <p className="flex flex-wrap gap-x-4 gap-y-2">
        <Link href="/crear-cuenta" className="font-semibold text-link">
          Crear una cuenta
        </Link>
        <Link href="/entrar/recuperar" className="font-semibold text-link">
          Olvidé mi contraseña
        </Link>
      </p>
    </div>
  );
}