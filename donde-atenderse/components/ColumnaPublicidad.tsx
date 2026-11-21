import { EspacioPublicitarioReservado } from "@/components/EspacioPublicitarioReservado";
import { PublicidadFarmaciaEjemplo } from "@/components/PublicidadFarmaciaEjemplo";
import { PublicidadProfesionalOrtiz } from "@/components/PublicidadProfesionalOrtiz";
import { mostrarDatosEjemplo } from "@/lib/config";

export async function ColumnaPublicidad() {
  if (!mostrarDatosEjemplo()) {
    return <EspacioPublicitarioReservado />;
  }
  return (
    <aside className="grid w-full auto-rows-max gap-4" aria-label="Espacios publicitarios">
      <PublicidadFarmaciaEjemplo />
      <PublicidadProfesionalOrtiz />
    </aside>
  );
}