import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioCuenta } from "@/components/FormularioCuenta";
import { usuarioActual } from "@/lib/auth";

export default async function CrearCuenta() {
  if (await usuarioActual()) redirect("/panel");
  return (
    <div className="grid gap-6">
      <h1 className="text-4xl font-semibold tracking-tight">Crear cuenta</h1>
      <p className="max-w-xl text-muted">
        Si tu matrícula ya está cargada, la ficha se vincula a tu cuenta. No se crea otra igual.
      </p>
      <FormularioCuenta />
      <p>
        <Link href="/entrar" className="font-semibold text-accent">
          Ya tengo cuenta
        </Link>
      </p>
    </div>
  );
}
