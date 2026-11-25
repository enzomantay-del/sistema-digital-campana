import { EspacioPublicitario } from "@/components/EspacioPublicitario";
import { PublicidadPruebaInicio } from "@/components/PublicidadPruebaInicio";
import { mostrarDatosEjemplo } from "@/lib/config";

/** Banda principal bajo el buscador en inicio. */
export function PublicidadPortada() {
  if (mostrarDatosEjemplo()) return <PublicidadPruebaInicio />;
  return <EspacioPublicitario formato="leaderboard" />;
}