"use client";

import { useActionState } from "react";
import { entrar, type Resultado } from "@/actions/auth";

export function FormularioEntrar() {
  const [estado, accion, pendiente] = useActionState<Resultado | null, FormData>(entrar, null);
  return (
    <form action={accion} className="grid max-w-xl gap-4">
      <label className="grid gap-1">
        Correo
        <input name="email" type="email" className="campo" autoComplete="email" required />
      </label>
      <label className="grid gap-1">
        Contraseña
        <input name="password" type="password" className="campo" autoComplete="current-password" required />
      </label>
      {estado && !estado.ok ? <p className="text-warn">{estado.error}</p> : null}
      <button className="boton w-fit" disabled={pendiente}>
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
