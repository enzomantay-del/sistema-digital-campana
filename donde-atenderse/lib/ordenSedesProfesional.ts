import { distanciaALocalidad } from "@/lib/geo";
import type { VistaSedeProfesional } from "@/lib/view";

/** Ordena sedes por distancia al pueblo más cercano a lat/lng (corredor Misiones). */
export function ordenarSedesPorCercania(sedes: VistaSedeProfesional[], lat: number, lng: number) {
  return [...sedes].sort((a, b) => {
    const da = distanciaALocalidad(a.locality, lat, lng);
    const db = distanciaALocalidad(b.locality, lat, lng);
    if (da !== db) return da - db;
    const loc = a.locality.localeCompare(b.locality, "es");
    if (loc !== 0) return loc;
    return a.placeName.localeCompare(b.placeName, "es");
  });
}