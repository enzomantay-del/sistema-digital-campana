import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioCuenta } from "@/components/FormularioCuenta";
import { usuarioActual } from "@/lib/auth";

export default async function CrearCuenta() {
  if (await usuarioActual()) redirect("/panel");
  return (
    <div className="grid gap-6">
      <h1 className="text-4xl font-bold tracking-tight">Crear cuenta</h1>
      <p className="max-w-xl text-muted">
        Creás tu ficha de profesional. La primera vez la revisamos antes de publicarla. Los lugares del corredor los
        carga Cercalud.
      </p>
      <FormularioCuenta />
      <p>
        <Link href="/entrar" className="font-semibold text-link">
          Ya tengo cuenta
        </Link>
      </p>
    </div>
  );
}
