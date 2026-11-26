"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buscarProfesionalPorMatricula } from "@/actions/professional";

export function BuscarMatriculaProfesional({ placeId }: { placeId: string }) {
  const router = useRouter();
  const [matricula, setMatricula] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [buscando, setBuscando] = useState(false);

  async function buscar(event: React.FormEvent) {
    event.preventDefault();
    setBuscando(true);
    setMensaje("");
    const resultado = await buscarProfesionalPorMatricula(matricula);
    setBuscando(false);
    if (resultado.ok) {
      router.push(`/panel/cargas/${placeId}/${resultado.id}`);
      return;
    }
    setMensaje(
      resultado.error ??
        "No hay ficha con esa matrícula. Podés crear una nueva abajo solo si estás seguro de que no existe otra.",
    );
  }

  return (
    <form onSubmit={(event) => void buscar(event)} className="tarjeta grid gap-3">
      <h2 className="text-lg font-semibold">¿El profesional ya está en Cercalud?</h2>
      <p className="text-sm text-muted">
        Siempre buscá primero por matrícula. Si el profesional ya está en Cercalud, abrí su ficha y cargá solo el horario en
        este lugar — no crees otra ficha.
      </p>
      <label className="grid gap-1">
        Matrícula
        <input className="campo" value={matricula} onChange={(event) => setMatricula(event.target.value)} required />
      </label>
      <button type="submit" className="boton-suave w-fit" disabled={buscando}>
        {buscando ? "Buscando…" : "Buscar"}
      </button>
      {mensaje ? <p className="text-sm text-muted">{mensaje}</p> : null}
    </form>
  );
}