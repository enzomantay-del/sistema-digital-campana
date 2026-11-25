export function RespaldoBaseAdmin() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Descargá un archivo con usuarios, lugares, fichas y fotos. Guardalo en tu PC y no lo compartas públicamente.
      </p>
      <a className="boton shrink-0" href="/api/admin/respaldo-base">
        Descargar respaldo (.json.gz)
      </a>
    </div>
  );
}