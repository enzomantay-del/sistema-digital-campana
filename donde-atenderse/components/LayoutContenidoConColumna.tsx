import { ColumnaPublicidad } from "@/components/ColumnaPublicidad";
import { PublicidadMovilEquivalenteColumna } from "@/components/PublicidadMovilEquivalenteColumna";

/** Páginas editoriales (p. ej. soy profesional): texto + columna comercial en desktop. */
export function LayoutContenidoConColumna({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-page items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-8">
      <div className="min-w-0 grid gap-6">
        <PublicidadMovilEquivalenteColumna perfil="editorial" anchoPantalla="lg" />
        {children}
      </div>
      <aside className="hidden w-full min-w-[280px] lg:block lg:sticky lg:top-24" aria-label="Espacio publicitario">
        <ColumnaPublicidad perfil="listado" />
      </aside>
    </div>
  );
}