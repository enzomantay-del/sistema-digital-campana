"use client";

import Link from "next/link";
import { CampoContrasena } from "@/components/CampoContrasena";

export function FormularioEntrarWeb({ error }: { error?: string }) {
  const falloCredenciales = Boolean(error?.toLowerCase().includes("no coinciden"));

  return (
    <form method="POST" action="/api/login" className="grid max-w-xl gap-4">
      <label className="grid gap-1">
        Correo
        <input name="email" type="email" className="campo" autoComplete="email" required />
      </label>
      <CampoContrasena autoComplete="current-password" />
      {error ? (
        <div className="grid gap-2 rounded-xl border border-line bg-paper px-4 py-3">
          <p className="text-warn">{error}</p>
          {falloCredenciales ? (
            <p className="text-sm text-muted">
              Revisá que el correo y la contraseña sean los mismos que configuraste en los Secrets de la app (o los que
              elegiste al crear la cuenta).
            </p>
          ) : null}
          <Link href="/entrar/recuperar" className="text-sm font-semibold text-link hover:underline">
            ¿Olvidaste la contraseña? Recuperar acceso
          </Link>
        </div>
      ) : null}
      <button className="boton w-fit" type="submit">
        Entrar
      </button>
    </form>
  );
}