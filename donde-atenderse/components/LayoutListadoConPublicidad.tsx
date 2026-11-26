import { ColumnaPublicidad } from "@/components/ColumnaPublicidad";

/** Listados (búsqueda, etc.): contenido + columna comercial en pantallas anchas. */
export function LayoutListadoConPublicidad({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:gap-6">
      <div className="grid min-w-0 gap-8">{children}</div>
      <div className="hidden w-full min-w-[280px] xl:block xl:sticky xl:top-24">
        <ColumnaPublicidad perfil="listado" />
      </div>
    </div>
  );
}