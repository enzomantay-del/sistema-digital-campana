import type { ReactNode } from "react";

/** Bloque del panel de administración con título y borde uniforme. */
export function PanelAdminSeccion({
  titulo,
  descripcion,
  accion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel-admin-bloque grid gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
        <div className="grid min-w-0 flex-1 gap-1">
          <h2 className="text-lg font-semibold tracking-tight">{titulo}</h2>
          {descripcion ? <p className="text-sm text-muted">{descripcion}</p> : null}
        </div>
        {accion ? <div className="shrink-0">{accion}</div> : null}
      </header>
      {children}
    </section>
  );
}