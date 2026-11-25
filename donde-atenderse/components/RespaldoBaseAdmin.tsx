export function RespaldoBaseAdmin() {
  return (
    <section className="mx-auto grid w-full max-w-xl gap-2 rounded-2xl border border-linea bg-card px-4 py-4">
      <h2 className="text-center text-lg font-semibold">Respaldo para migrar</h2>
      <p className="text-center text-sm text-muted">
        Descargá un archivo con usuarios, lugares, fichas y fotos. Guardalo en tu PC y no lo compartas
        públicamente.
      </p>
      <div className="flex justify-center">
        <a className="boton" href="/api/admin/respaldo-base">
          Descargar respaldo (.json.gz)
        </a>
      </div>
    </section>
  );
}