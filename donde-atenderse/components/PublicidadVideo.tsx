"use client";

import { useEffect, useRef } from "react";

export function PublicidadVideo({
  src,
  etiquetaAccesible,
  alturaNatural = false,
}: {
  src: string;
  etiquetaAccesible: string;
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

  const attrs = {
    ref,
    className: alturaNatural
      ? "video-publicidad video-publicidad--fila block h-auto w-full max-w-full"
      : "video-publicidad video-publicidad--vertical block h-full w-full object-contain object-top",
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
    return <video {...attrs} />;
  }

  return (
    <div className="publicidad-video-recorte absolute inset-0 overflow-hidden">
      <video {...attrs} />
    </div>
  );
}