"use client";

import Link from "next/link";

export default function ErrorEntrar({ reset }: { reset: () => void }) {
  return (
    <div className="grid max-w-xl gap-4">
      <h1 className="text-2xl font-bold">No se pudo abrir el ingreso</h1>
      <p className="text-muted">
        Probá borrar las cookies de este sitio en el navegador, o abrí la página en una ventana de incógnito.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="boton" onClick={() => reset()}>
          Reintentar
        </button>
        <Link href="/" className="boton-suave">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}