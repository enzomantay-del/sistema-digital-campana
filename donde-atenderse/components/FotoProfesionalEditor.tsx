"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { quitarFotoProfesional, subirFotoProfesional } from "@/actions/professional";

export function FotoProfesionalEditor({
  professionalId,
  photoUrl,
  onChange,
}: {
  professionalId: string;
  photoUrl: string;
  onChange: (photoUrl: string) => void;
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
      const resultado = await subirFotoProfesional(professionalId, datos);
      if (!resultado.ok) {
        setMensaje(resultado.error);
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
    const resultado = await quitarFotoProfesional(professionalId);
    setCargando(false);
    if (!resultado.ok) {
      setMensaje(resultado.error);
      return;
    }
    onChange("");
    setMensaje("Foto quitada.");
    if (entrada.current) entrada.current.value = "";
  }

  return (
    <fieldset className="grid gap-3">
      <legend className="font-semibold">Foto del profesional</legend>
      <p className="text-sm text-muted">
        Aparece en la ficha pública. JPG, JPEG, JFIF, PNG, WebP o GIF, hasta 2 MB.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        {photoUrl ? (
          <div className="relative h-24 w-24 overflow-hidden rounded-full border border-line bg-white">
            <Image src={photoUrl} alt="Foto del profesional" fill className="object-cover" sizes="96px" unoptimized />
          </div>
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-line bg-[#f8fafc] text-xs text-muted">
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
    </fieldset>
  );
}