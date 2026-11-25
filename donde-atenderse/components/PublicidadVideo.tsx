"use client";

import { useEffect, useRef } from "react";

/** Video de aviso sin controles visibles (refuerza CSS ante controles nativos del navegador). */
export function PublicidadVideo({
  src,
  etiquetaAccesible,
  ajuste = "contain",
}: {
  src: string;
  etiquetaAccesible: string;
  ajuste?: "contain" | "cover";
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
    video.addEventListener("playing", sinControles);

    return () => {
      video.removeEventListener("loadedmetadata", sinControles);
      video.removeEventListener("play", sinControles);
      video.removeEventListener("playing", sinControles);
    };
  }, [src]);

  const objectClass = ajuste === "contain" ? "object-contain object-top" : "object-cover object-center";

  return (
    <div className="publicidad-video-recorte absolute inset-0 overflow-hidden">
      <video
        ref={ref}
        className={`video-publicidad block w-full ${objectClass}`}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-label={etiquetaAccesible}
      />
    </div>
  );
}