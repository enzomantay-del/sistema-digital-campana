"use client";

import { useEffect, useRef } from "react";

/** Video de aviso sin controles visibles (refuerza CSS ante controles nativos del navegador). */
export function PublicidadVideo({
  src,
  etiquetaAccesible,
  alturaNatural = false,
}: {
  src: string;
  etiquetaAccesible: string;
  /** Bandas horizontales: altura del archivo, sin caja aspect que deje hueco abajo. */
  alturaNatural?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const sinControles = () => {
      video.controls = false;
      video.removeAttribute("controls");
    };

    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
    sinControles();
    video.addEventListener("loadedmetadata", sinControles);
    video.addEventListener("play", sinControles);
    video.addEventListener("playing", sinControles);
    video.addEventListener("timeupdate", sinControles);

    return () => {
      video.removeEventListener("loadedmetadata", sinControles);
      video.removeEventListener("play", sinControles);
      video.removeEventListener("playing", sinControles);
      video.removeEventListener("timeupdate", sinControles);
    };
  }, [src]);

  const attrs = {
    src,
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "auto" as const,
    controls: false,
    controlsList: "nodownload noplaybackrate nofullscreen noremoteplayback",
    disablePictureInPicture: true,
    disableRemotePlayback: true,
    tabIndex: -1,
    "aria-label": etiquetaAccesible,
  };

  if (alturaNatural) {
    return (
      <div className="publicidad-video-envoltorio publicidad-video-envoltorio--fila relative w-full overflow-hidden bg-black leading-[0]">
        <video ref={ref} className="video-publicidad video-publicidad--fila block h-auto w-full max-w-full" {...attrs} />
      </div>
    );
  }

  return (
    <div className="publicidad-video-envoltorio publicidad-video-recorte absolute inset-0 overflow-hidden bg-black">
      <video ref={ref} className="video-publicidad video-publicidad--vertical" {...attrs} />
    </div>
  );
}