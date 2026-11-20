"use client";

import type { ReactNode } from "react";

type Accion = {
  label: string;
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  tono?: "link" | "boton" | "suave" | "peligro";
  confirmar?: string;
};

function clase(tono: Accion["tono"]) {
  if (tono === "boton") return "boton";
  if (tono === "suave") return "boton-suave";
  if (tono === "peligro") return "font-semibold text-warn";
  return "font-semibold text-link";
}

export function AccionesAdmin({
  acciones,
  extra,
}: {
  acciones: Accion[];
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {extra}
      {acciones.map((accion) => (
        <form
          key={`${accion.label}-${accion.id}`}
          action={accion.action}
          onSubmit={(event) => {
            if (accion.confirmar && !window.confirm(accion.confirmar)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={accion.id} />
          <button className={clase(accion.tono)} type="submit">
            {accion.label}
          </button>
        </form>
      ))}
    </div>
  );
}
