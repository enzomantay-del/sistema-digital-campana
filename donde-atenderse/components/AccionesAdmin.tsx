"use client";

import type { ReactNode } from "react";

type Accion = {
  label: string;
  /** Server action (legacy). Preferir `href` + `accionCampo`. */
  action?: (formData: FormData) => void | Promise<void>;
  /** POST clásico (recomendado en hosting). */
  href?: string;
  /** Valor del campo oculto `accion` cuando se usa `href`. */
  accionCampo?: string;
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
  compacto = false,
}: {
  acciones: Accion[];
  extra?: ReactNode;
  compacto?: boolean;
}) {
  return (
    <div
      className={
        compacto ? "flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.875rem]" : "flex flex-wrap items-center gap-x-4 gap-y-2"
      }
    >
      {extra}
      {acciones.map((accion) => (
        <form
          key={`${accion.label}-${accion.id}`}
          action={accion.href ?? accion.action}
          method={accion.href ? "post" : undefined}
          onSubmit={(event) => {
            if (accion.confirmar && !window.confirm(accion.confirmar)) {
              event.preventDefault();
            }
          }}
        >
          {accion.href && accion.accionCampo ? (
            <input type="hidden" name="accion" value={accion.accionCampo} />
          ) : null}
          <input type="hidden" name="id" value={accion.id} />
          <button className={clase(accion.tono)} type="submit">
            {accion.label}
          </button>
        </form>
      ))}
    </div>
  );
}