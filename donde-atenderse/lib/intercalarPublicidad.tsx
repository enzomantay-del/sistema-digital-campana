import type { ReactNode } from "react";
import { PublicidadEntreListado } from "@/components/PublicidadEntreListado";

/** Inserta un espacio comercial cada `cada` ítems (si hay suficientes resultados). */
export function intercalarPublicidadEnListado(nodos: ReactNode[], cada = 4): ReactNode[] {
  if (nodos.length <= cada) return nodos;
  const salida: ReactNode[] = [];
  let bloque = 0;
  nodos.forEach((nodo, i) => {
    salida.push(nodo);
    if ((i + 1) % cada === 0 && i < nodos.length - 1) {
      salida.push(<PublicidadEntreListado key={`pub-listado-${i}`} indice={bloque} />);
      bloque += 1;
    }
  });
  return salida;
}