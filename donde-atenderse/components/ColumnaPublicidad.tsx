import { EspacioPublicitario } from "@/components/EspacioPublicitario";
import { PublicidadFarmaciaEjemplo } from "@/components/PublicidadFarmaciaEjemplo";
import { PublicidadProfesionalOrtiz } from "@/components/PublicidadProfesionalOrtiz";
import { mostrarDatosEjemplo } from "@/lib/config";
import type { VariantePublicidad } from "@/lib/formatosPublicidad";

/** Máximo dos avisos por página; la columna aporta como mucho uno (el otro va en el flujo principal). */
const SLOT_FICHA: Exclude<VariantePublicidad, "contenido"> = "skyscraper";
const SLOT_LISTADO: Exclude<VariantePublicidad, "contenido"> = "skyscraper";
const SLOT_FARMACIA: Exclude<VariantePublicidad, "contenido"> = "vertical-alto";

type Perfil = "ficha" | "listado" | "farmacia";

export async function ColumnaPublicidad({ perfil = "ficha" }: { perfil?: Perfil }) {
  const demo = mostrarDatosEjemplo();
  const formato =
    perfil === "ficha" ? SLOT_FICHA : perfil === "farmacia" ? SLOT_FARMACIA : SLOT_LISTADO;

  if (demo && perfil === "ficha") {
    return (
      <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
        <PublicidadFarmaciaEjemplo />
        <PublicidadProfesionalOrtiz />
      </aside>
    );
  }

  if (demo && perfil === "listado") {
    return (
      <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
        <PublicidadFarmaciaEjemplo />
      </aside>
    );
  }

  if (demo && perfil === "farmacia") {
    return (
      <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
        <PublicidadFarmaciaEjemplo />
      </aside>
    );
  }

  if (perfil === "farmacia") {
    return (
      <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
        <EspacioPublicitario formato={formato} descripcion="Ideal para farmacias del corredor." />
      </aside>
    );
  }

  return (
    <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
      <EspacioPublicitario formato={formato} />
    </aside>
  );
}