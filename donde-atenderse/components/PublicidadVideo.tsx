"use client";

import { useEffect, useRef } from "react";

/** Video de aviso sin controles visibles (refuerza CSS ante controles nativos del navegador). */
export function PublicidadVideo({
  src,
  etiquetaAccesible,
  ajuste = "contain",
  taparBarraInferior = true,
}: {
  src: string;
  etiquetaAccesible: string;
  /** contain en bandas horizontales evita cortar texto; cover en columnas verticales. */
  ajuste?: "contain" | "cover";
  taparBarraInferior?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const sinControles = () => {
      video.controls = false;
      video.removeAttribute("controls");
    };

    sinControles();
    video.addEventListener("loadedmetadata", sinControles);
    video.addEventListener("play", sinControles);

    return () => {
      video.removeEventListener("loadedmetadata", sinControles);
      video.removeEventListener("play", sinControles);
    };
  }, [src]);

  const objectClass = ajuste === "contain" ? "object-contain" : "object-cover";

  return (
    <>
      <video
        ref={ref}
        className={`video-publicidad block h-full w-full ${objectClass}`}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-label={etiquetaAccesible}
      />
      {taparBarraInferior ? (
        <div className="publicidad-tapa-barra pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-[#0f1f33]" aria-hidden />
      ) : null}
    </>
  );
}