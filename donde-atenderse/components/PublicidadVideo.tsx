"use client";

import { useEffect, useRef } from "react";

/** Video de aviso sin controles visibles (refuerza CSS ante controles nativos del navegador). */
export function PublicidadVideo({ src, etiquetaAccesible }: { src: string; etiquetaAccesible: string }) {
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
    video.addEventListener("loadeddata", sinControles);
    video.addEventListener("play", sinControles);
    video.addEventListener("timeupdate", sinControles);

    return () => {
      video.removeEventListener("loadedmetadata", sinControles);
      video.removeEventListener("loadeddata", sinControles);
      video.removeEventListener("play", sinControles);
      video.removeEventListener("timeupdate", sinControles);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className="video-publicidad block h-[calc(100%+14px)] w-full max-h-none object-cover object-center"
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
  );
}