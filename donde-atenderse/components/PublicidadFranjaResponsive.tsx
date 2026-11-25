import { PublicidadCreatividad } from "@/components/PublicidadCreatividad";

/**
 * Celular: skyscraper (300×600) legible.
 * Tablet/PC: banda horizontal (banner).
 */
export function PublicidadFranjaResponsive() {
  return (
  <>
      <div className="w-full py-0.5 md:hidden">
        <PublicidadCreatividad formato="skyscraper" etiquetaAccesible="Publicidad en video vertical" />
      </div>
      <div className="hidden w-full py-0.5 md:block">
        <PublicidadCreatividad formato="banner" anchoFila />
      </div>
    </>
  );
}