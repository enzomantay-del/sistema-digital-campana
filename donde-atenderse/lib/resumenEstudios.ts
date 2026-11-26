/** Texto breve de estudios/prácticas para listados (evita tarjetas kilométricas). */
export function resumenEstudios(nombres: string[], maxVisibles = 4): string {
  const limpios = nombres.map((n) => n.trim()).filter(Boolean);
  if (limpios.length === 0) return "";
  if (limpios.length <= maxVisibles) return limpios.join(" · ");
  const visibles = limpios.slice(0, maxVisibles).join(" · ");
  return `${visibles} · y ${limpios.length - maxVisibles} más`;
}