/** Lugares que una secretaría puede tener asignados (turnero de farmacias: solo admin). */
export function lugarPermiteCargaSecretaria(kind: string) {
  return kind !== "farmacia";
}