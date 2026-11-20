import { PublicidadFarmaciaEjemplo } from "@/components/PublicidadFarmaciaEjemplo";
import { PublicidadProfesionalOrtiz } from "@/components/PublicidadProfesionalOrtiz";

export async function ColumnaPublicidad() {
  return (
    <aside className="grid w-full gap-4" aria-label="Espacios publicitarios">
      <PublicidadFarmaciaEjemplo />
      <PublicidadProfesionalOrtiz />
    </aside>
  );
}