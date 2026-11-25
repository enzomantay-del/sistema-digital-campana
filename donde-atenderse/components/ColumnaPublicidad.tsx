import { EspacioPublicitario } from "@/components/EspacioPublicitario";
import { PublicidadFarmaciaEjemplo } from "@/components/PublicidadFarmaciaEjemplo";
import { PublicidadProfesionalOrtiz } from "@/components/PublicidadProfesionalOrtiz";
import { mostrarDatosEjemplo } from "@/lib/config";
import type { VariantePublicidad } from "@/lib/formatosPublicidad";

const SLOTS_FICHA: Exclude<VariantePublicidad, "contenido">[] = ["skyscraper", "vertical-alto", "mpu"];
const SLOTS_LISTADO: Exclude<VariantePublicidad, "contenido">[] = ["skyscraper", "cuadrado"];

type Perfil = "ficha" | "listado";

export async function ColumnaPublicidad({ perfil = "ficha" }: { perfil?: Perfil }) {
  const demo = mostrarDatosEjemplo();

  if (demo && perfil === "ficha") {
    return (
      <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
        <PublicidadFarmaciaEjemplo />
        <PublicidadProfesionalOrtiz />
        <EspacioPublicitario formato="cuadrado" />
      </aside>
    );
  }

  if (demo && perfil === "listado") {
    return (
      <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
        <PublicidadFarmaciaEjemplo />
        <EspacioPublicitario formato="mpu" />
      </aside>
    );
  }

  const slots = perfil === "ficha" ? SLOTS_FICHA : SLOTS_LISTADO;

  return (
    <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
      {slots.map((formato) => (
        <EspacioPublicitario key={formato} formato={formato} />
      ))}
    </aside>
  );
}