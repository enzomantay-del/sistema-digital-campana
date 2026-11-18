import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioEntrar } from "@/components/FormularioEntrar";
import { usuarioActual } from "@/lib/auth";

export default async function Entrar() {
  if (await usuarioActual()) redirect("/panel");
  return (
    <div className="grid gap-6">
      <h1 className="text-4xl font-semibold tracking-tight">Entrar</h1>
      <p className="max-w-xl text-muted">
        Desde acá cargás tu ficha. El paciente no necesita una cuenta para buscar.
      </p>
      <FormularioEntrar />
      <p>
        <Link href="/crear-cuenta" className="font-semibold text-accent">
          Crear una cuenta
        </Link>
      </p>
    </div>
  );
}
