import { ColumnaPublicidad } from "@/components/ColumnaPublicidad";

/** Farmacia de turno: contenido + columna comercial en pantallas anchas (rellena el costado). */
export function LayoutFarmaciaConPublicidad({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid w-full items-start gap-3 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-6">
      <div className="grid min-w-0 w-full gap-8">{children}</div>
      <div className="hidden w-full max-w-[300px] justify-self-end xl:block xl:sticky xl:top-24">
        <ColumnaPublicidad perfil="farmacia" />
      </div>
    </div>
  );
}