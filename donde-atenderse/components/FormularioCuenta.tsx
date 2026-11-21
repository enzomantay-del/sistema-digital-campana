"use client";

import Link from "next/link";
import { useActionState } from "react";
import { crearCuenta, type Resultado } from "@/actions/auth";

export function FormularioCuenta() {
  const [estado, accion, pendiente] = useActionState<Resultado | null, FormData>(crearCuenta, null);

  return (
    <form action={accion} className="grid max-w-xl gap-4">
      <p className="text-muted">
        Creás tu ficha de profesional. Revisamos matrícula y WhatsApp antes de publicar. Los hospitales, sanatorios y
        consultorios los carga Cercalud.
      </p>
      <label className="grid gap-1">
        Tu nombre
        <input name="name" className="campo" autoComplete="name" required />
      </label>
      <label className="grid gap-1">
        Correo (tenés que poder recibir ahí; lo usamos solo para la cuenta)
        <input name="email" type="email" className="campo" autoComplete="email" required />
      </label>
      <label className="grid gap-1">
        WhatsApp
        <input name="whatsapp" type="tel" className="campo" autoComplete="tel" placeholder="Ej. 3754421234" required />
      </label>
      <label className="grid gap-1">
        Contraseña
        <input name="password" type="password" className="campo" autoComplete="new-password" minLength={8} required />
      </label>
      <label className="grid gap-1">
        Matrícula
        <input name="license" className="campo" minLength={3} required />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input name="aceptaTerminos" type="checkbox" className="mt-1" required />
        <span>
          Acepto los{" "}
          <Link href="/terminos" className="font-semibold text-link hover:underline" target="_blank">
            términos de uso
          </Link>{" "}
          y confirmo que el correo y el WhatsApp son míos.
        </span>
      </label>
      {estado && !estado.ok ? <p className="text-warn">{estado.error}</p> : null}
      <button className="boton w-fit" disabled={pendiente}>
        {pendiente ? "Creando la cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}