import { ColumnaPublicidad } from "@/components/ColumnaPublicidad";

/** Listados (búsqueda, etc.): contenido + columna comercial en pantallas anchas. */
export function LayoutListadoConPublicidad({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] xl:gap-2">
      <div className="grid min-w-0 gap-8">{children}</div>
      <div className="hidden min-w-0 xl:block xl:sticky xl:top-24">
        <ColumnaPublicidad perfil="listado" />
      </div>
    </div>
  );
}