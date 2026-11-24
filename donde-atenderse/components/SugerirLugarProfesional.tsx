"use client";

import { useState } from "react";
import { LOCALIDADES, TIPOS_LUGAR } from "@/lib/constants";

export function SugerirLugarProfesional({
  onSugerido,
}: {
  onSugerido: (lugar: { id: string; name: string; locality: string; kind: string }) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState("consultorio");
  const [locality, setLocality] = useState("Jardín América");
  const [address, setAddress] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    setCargando(true);
    setMensaje("");
    try {
      const respuesta = await fetch("/api/lugar/sugerir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, kind, locality, address }),
      });
      const resultado = (await respuesta.json()) as
        | { ok: true; placeId: string; name: string; locality: string; kind: string }
        | { ok: false; error: string };
      if (!resultado.ok) {
        setMensaje(resultado.error);
        return;
      }
      onSugerido({
        id: resultado.placeId,
        name: resultado.name,
        locality: resultado.locality,
        kind: resultado.kind,
      });
      setMensaje("Sugerencia enviada. Cercalud la revisa; mientras tanto podés cargar tu horario ahí.");
      setName("");
      setAddress("");
      setAbierto(false);
    } catch {
      setMensaje("No se pudo enviar la sugerencia.");
    } finally {
      setCargando(false);
    }
  }

  if (!abierto) {
    return (
      <button type="button" className="w-fit text-sm font-semibold text-link underline-offset-2 hover:underline" onClick={() => setAbierto(true)}>
        ¿No está en la lista? Sugerir un centro nuevo
      </button>
    );
  }

  return (
    <form onSubmit={(event) => void enviar(event)} className="grid gap-3 rounded-2xl border border-dashed border-menta/50 bg-[#f0faf7] p-4">
      <h3 className="font-semibold text-ink">Sugerir un centro donde atendés</h3>
      <p className="text-sm text-muted">
        Si el hospital, consultorio o sanatorio no aparece al agregar sede, completá estos datos. Cercalud lo revisa; mientras
        tanto podés cargar tu horario ahí.
      </p>
      <label className="grid gap-1 text-sm">
        Nombre del centro
        <input className="campo" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Tipo
          <select className="campo" value={kind} onChange={(event) => setKind(event.target.value)}>
            {TIPOS_LUGAR.filter((t) => t.id !== "farmacia").map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Localidad
          <select className="campo" value={locality} onChange={(event) => setLocality(event.target.value)}>
            {LOCALIDADES.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        Dirección (opcional)
        <input className="campo" value={address} onChange={(event) => setAddress(event.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="boton w-fit text-sm" disabled={cargando}>
          {cargando ? "Enviando…" : "Enviar sugerencia"}
        </button>
        <button type="button" className="boton-suave w-fit text-sm" onClick={() => setAbierto(false)}>
          Cancelar
        </button>
      </div>
      {mensaje ? <p className="text-sm text-muted">{mensaje}</p> : null}
    </form>
  );
}