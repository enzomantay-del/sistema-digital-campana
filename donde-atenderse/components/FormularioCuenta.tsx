"use client";

import { useActionState } from "react";
import { crearCuenta, type Resultado } from "@/actions/auth";

export function FormularioCuenta() {
  const [estado, accion, pendiente] = useActionState<Resultado | null, FormData>(crearCuenta, null);

  return (
    <form action={accion} className="grid max-w-xl gap-4">
      <p className="text-muted">
        Creás tu ficha de profesional. Los hospitales, sanatorios y consultorios los carga Cercalud. Si el tuyo no
        aparece, lo podés sugerir desde tu ficha.
      </p>
      <label className="grid gap-1">
        Tu nombre
        <input name="name" className="campo" autoComplete="name" required />
      </label>
      <label className="grid gap-1">
        Correo
        <input name="email" type="email" className="campo" autoComplete="email" required />
      </label>
      <label className="grid gap-1">
        Contraseña
        <input name="password" type="password" className="campo" autoComplete="new-password" minLength={8} required />
      </label>
      <label className="grid gap-1">
        Matrícula
        <input name="license" className="campo" />
      </label>
      {estado && !estado.ok ? <p className="text-warn">{estado.error}</p> : null}
      <button className="boton w-fit" disabled={pendiente}>
        {pendiente ? "Creando la cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
