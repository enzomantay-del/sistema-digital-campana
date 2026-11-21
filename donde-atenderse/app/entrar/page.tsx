import Link from "next/link";
import { FormularioEntrar } from "@/components/FormularioEntrar";
import { esAdmin, usuarioActual } from "@/lib/auth";

export default async function Entrar() {
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
      <FormularioEntrar />
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
