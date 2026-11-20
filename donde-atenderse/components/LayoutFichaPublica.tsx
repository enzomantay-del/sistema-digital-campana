import { PublicidadFarmaciaEjemplo } from "@/components/PublicidadFarmaciaEjemplo";

export function LayoutFichaPublica({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid w-full max-w-none items-start gap-8 lg:grid-cols-[minmax(0,42rem)_minmax(17rem,22rem)] lg:gap-10 xl:grid-cols-[minmax(0,42rem)_320px]">
      <div className="min-w-0">{children}</div>
      <aside className="min-w-0 lg:sticky lg:top-24">
        <PublicidadFarmaciaEjemplo />
      </aside>
    </div>
  );
}