"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export function LogoLugarEditor({
  placeId,
  logoUrl,
  onChange,
}: {
  placeId: string;
  logoUrl: string;
  onChange: (logoUrl: string) => void;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function elegirArchivo(event: React.ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    setCargando(true);
    setMensaje("Subiendo…");
    const datos = new FormData();
    datos.set("logo", archivo);
    const respuesta = await fetch(`/api/lugar/${placeId}/logo`, { method: "POST", body: datos, credentials: "same-origin" });
    const resultado = (await respuesta.json()) as { ok: boolean; logoUrl?: string; error?: string };
    setCargando(false);
    if (!resultado.ok || !resultado.logoUrl) {
      setMensaje(resultado.error ?? "No se pudo subir el logo.");
      return;
    }
    onChange(resultado.logoUrl);
    setMensaje("Logo guardado.");
    if (entrada.current) entrada.current.value = "";
  }

  async function quitar() {
    setCargando(true);
    setMensaje("Quitando…");
    const respuesta = await fetch(`/api/lugar/${placeId}/logo`, { method: "DELETE", credentials: "same-origin" });
    const resultado = (await respuesta.json()) as { ok: boolean; error?: string };
    setCargando(false);
    if (!resultado.ok) {
      setMensaje(resultado.error ?? "No se pudo quitar el logo.");
      return;
    }
    onChange("");
    setMensaje("Logo quitado.");
    if (entrada.current) entrada.current.value = "";
  }

  return (
    <fieldset className="grid gap-3">
      <legend className="font-semibold">Logo del lugar</legend>
      <p className="text-sm text-muted">Aparece en la ficha pública. JPG, JFIF, PNG, WebP o GIF, hasta 2 MB.</p>
      <div className="flex flex-wrap items-center gap-4">
        {logoUrl ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-line bg-white">
            <Image src={logoUrl} alt="Logo del lugar" fill className="object-contain p-1" sizes="80px" unoptimized />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-line bg-[#f8fafc] text-xs text-muted">
            Sin logo
          </div>
        )}
        <div className="grid gap-2">
          <input
            ref={entrada}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.jfif,.jpe"
            className="text-sm"
            disabled={cargando}
            onChange={(event) => void elegirArchivo(event)}
          />
          {logoUrl ? (
            <button type="button" className="w-fit text-sm font-semibold text-accent" disabled={cargando} onClick={() => void quitar()}>
              Quitar logo
            </button>
          ) : null}
        </div>
      </div>
      {mensaje ? <p className="text-sm text-muted">{mensaje}</p> : null}
    </fieldset>
  );
}