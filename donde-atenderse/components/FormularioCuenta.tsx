"use client";

import { useActionState, useState } from "react";
import { crearCuenta, type Resultado } from "@/actions/auth";
import { LOCALIDADES, TIPOS_LUGAR } from "@/lib/constants";

export function FormularioCuenta() {
  const [estado, accion, pendiente] = useActionState<Resultado | null, FormData>(crearCuenta, null);
  const [tipo, setTipo] = useState("profesional");

  return (
    <form action={accion} className="grid max-w-xl gap-4">
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
      <fieldset className="grid gap-2">
        <legend>Qué vas a cargar</legend>
        <label className="flex gap-2">
          <input type="radio" name="tipo" value="profesional" checked={tipo === "profesional"} onChange={() => setTipo("profesional")} />
          Mi ficha de profesional
        </label>
        <label className="flex gap-2">
          <input type="radio" name="tipo" value="lugar" checked={tipo === "lugar"} onChange={() => setTipo("lugar")} />
          Un hospital, sanatorio, consultorio u otro lugar
        </label>
      </fieldset>
      {tipo === "profesional" ? (
        <label className="grid gap-1">
          Matrícula
          <input name="license" className="campo" />
        </label>
      ) : (
        <div className="grid gap-4">
          <label className="grid gap-1">
            Nombre del lugar
            <input name="placeName" className="campo" required />
          </label>
          <label className="grid gap-1">
            Tipo
            <select name="kind" className="campo" defaultValue="consultorio">
              {TIPOS_LUGAR.map((tipoLugar) => (
                <option key={tipoLugar.id} value={tipoLugar.id}>
                  {tipoLugar.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            Localidad
            <select name="locality" className="campo" defaultValue="Jardín América">
              {LOCALIDADES.map((localidad) => (
                <option key={localidad}>{localidad}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {estado && !estado.ok ? <p className="text-warn">{estado.error}</p> : null}
      <button className="boton w-fit" disabled={pendiente}>
        {pendiente ? "Creando la cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
