/** Normalización mínima para Argentina — Fase 1 (sin libphonenumber para mantener deps livianas). */
export function normalizarTelefono(raw: string): string {
  let s = raw.trim().replace(/\s+/g, "").replace(/-/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("54") && !s.startsWith("+")) s = "+" + s;
  if (s.startsWith("15") && s.length >= 10) s = s.slice(2);
  if (/^\d{10}$/.test(s)) s = "+549" + s;
  if (/^11\d{8}$/.test(s)) s = "+549" + s;
  if (/^9\d{9,10}$/.test(s) && !s.startsWith("+")) s = "+54" + s;
  return s;
}
