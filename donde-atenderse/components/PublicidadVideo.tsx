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

  if (alturaNatural) {
    return (
      <video
        ref={ref}
        className="video-publicidad video-publicidad--fila block h-auto w-full max-w-full"
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
    );
  }

  return (
    <div className="publicidad-video-recorte absolute inset-0 overflow-hidden">
      <video
        ref={ref}
        className="video-publicidad video-publicidad--vertical block w-full object-contain object-top"
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