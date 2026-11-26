/** Mensaje corto bajo un campo del formulario del panel. */
export function AvisoCampo({ mensaje, id }: { mensaje?: string | null; id?: string }) {
  if (!mensaje) return null;
  return (
    <p id={id} className="text-sm font-semibold leading-snug text-warn" role="alert">
      {mensaje}
    </p>
  );
}

export function claseCampoConError(error?: string | null, base = "campo") {
  return error ? `${base} border-warn ring-1 ring-warn/40` : base;
}