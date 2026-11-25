"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export function FotoProfesionalEditor({
  professionalId,
  photoUrl,
  onChange,
  placeIdEnfoque,
  avisoCampo,
}: {
  professionalId: string;
  photoUrl: string;
  onChange: (photoUrl: string) => void;
  placeIdEnfoque?: string;
  avisoCampo?: string | null;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function elegirArchivo(event: React.ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    setCargando(true);
    setMensaje("Subiendo…");
    try {
      const datos = new FormData();
      datos.set("foto", archivo);
      if (placeIdEnfoque) datos.set("placeIdEnfoque", placeIdEnfoque);
      const respuesta = await fetch(`/api/profesional/${professionalId}/foto`, {
        method: "POST",
        body: datos,
        credentials: "same-origin",
      });
      const resultado = (await respuesta.json()) as { ok: boolean; photoUrl?: string; error?: string };
      if (!resultado.ok || !resultado.photoUrl) {
        setMensaje(resultado.error ?? "No se pudo subir la foto.");
        return;
      }
      onChange(resultado.photoUrl);
      setMensaje("Foto guardada.");
    } catch {
      setMensaje("No se pudo subir la foto. Recargá la página e intentá de nuevo.");
    } finally {
      setCargando(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  async function quitar() {
    setCargando(true);
    try {
      const deleteUrl = placeIdEnfoque
        ? `/api/profesional/${professionalId}/foto?placeIdEnfoque=${encodeURIComponent(placeIdEnfoque)}`
        : `/api/profesional/${professionalId}/foto`;
      const respuesta = await fetch(deleteUrl, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const resultado = (await respuesta.json()) as { ok: boolean; error?: string };
      if (!resultado.ok) {
        setMensaje(resultado.error ?? "No se pudo quitar la foto.");
        return;
      }
      onChange("");
      setMensaje("Foto quitada.");
    } catch {
      setMensaje("No se pudo quitar la foto.");
    } finally {
      setCargando(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  const bordeFalta = avisoCampo && !photoUrl;

  return (
    <fieldset
      className={`grid gap-3 ${bordeFalta ? "rounded-2xl border border-warn bg-[#fff8f8] p-3" : ""}`}
      id={avisoCampo ? "campo-error-foto" : undefined}
    >
      <legend className="font-semibold">Foto del profesional</legend>
      <p className="text-sm text-muted">
        Aparece en la ficha pública. JPG, JPEG, JFIF, PNG, WebP o GIF, hasta 2 MB.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        {photoUrl ? (
          <div className="relative h-28 w-28 overflow-hidden rounded-full border border-line bg-white">
            <Image src={photoUrl} alt="Foto del profesional" fill className="object-cover" sizes="112px" unoptimized />
          </div>
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-line bg-[#f8fafc] text-xs text-muted">
            Sin foto
          </div>
        )}
        <div className="grid gap-2">
          <input
            ref={entrada}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.jfif"
            className="text-sm"
            disabled={cargando}
            onChange={(event) => void elegirArchivo(event)}
          />
          {photoUrl ? (
            <button type="button" className="w-fit text-sm font-semibold text-accent" disabled={cargando} onClick={() => void quitar()}>
              Quitar foto
            </button>
          ) : null}
        </div>
      </div>
      {mensaje ? <p className="text-sm text-muted">{mensaje}</p> : null}
      {avisoCampo ? (
        <p className="text-sm font-semibold leading-snug text-warn" role="alert">
          {avisoCampo}
        </p>
      ) : null}
    </fieldset>
  );
}