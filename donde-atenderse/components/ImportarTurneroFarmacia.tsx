export function ImportarTurneroFarmacia({
  turneroOk,
  cargados,
  turneroSin,
  turneroInvalidas,
  turneroError,
}: {
  turneroOk?: boolean;
  cargados?: number;
  turneroSin?: string[];
  turneroInvalidas?: string[];
  turneroError?: string;
}) {
  const mensajeError =
    turneroError === "vacio"
      ? "Pegá el turnero o subí el archivo."
      : turneroError === "formulario"
        ? "No llegaron los datos del formulario. Probá pegando el texto en el cuadro."
        : turneroError === "archivo"
          ? "No se pudo leer el archivo. Probá pegando el texto."
          : turneroError === "servidor"
            ? "Falló el importador en el servidor. Probá de nuevo en un minuto."
            : turneroError
              ? decodeURIComponent(turneroError)
              : "";

  return (
    <form
      action="/api/admin/turnero"
      method="post"
      encType="multipart/form-data"
      className="tarjeta grid max-w-2xl gap-4 text-left"
    >
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold">Turnero de farmacias</h2>
        <p className="text-sm text-muted">
          Los turnos los carga Cercalud desde la planilla oficial. Vos publicás las farmacias; acá importamos inicio y fin con
          hora exacta (hora de Misiones). Formato por fila: localidad; nombre; inicio; fin; fuente.
        </p>
      </div>
      {turneroOk && typeof cargados === "number" ? (
        <div className="rounded-xl border border-menta bg-[#e8f7f3] px-3 py-2 text-sm" role="status">
          <p className="font-semibold text-menta">
            Se cargaron {cargados} turno{cargados === 1 ? "" : "s"}.
          </p>
          {turneroSin && turneroSin.length > 0 ? (
            <p className="mt-1 text-warn">
              Sin farmacia publicada con ese nombre: {turneroSin.slice(0, 5).join(" · ")}
              {turneroSin.length > 5 ? ` (+${turneroSin.length - 5})` : ""}
            </p>
          ) : null}
          {turneroInvalidas && turneroInvalidas.length > 0 ? (
            <p className="mt-1 text-warn">{turneroInvalidas.join(" · ")}</p>
          ) : null}
        </div>
      ) : null}
      {mensajeError ? <p className="text-sm text-warn">{mensajeError}</p> : null}
      <label className="grid gap-1 text-sm">
        Archivo CSV o TXT
        <input name="archivo" type="file" accept=".csv,.txt,text/csv,text/plain" className="campo" />
      </label>
      <label className="grid gap-1 text-sm">
        O pegá las filas acá
        <textarea
          name="texto"
          className="campo min-h-28 font-mono text-xs"
          placeholder={`Jardín América;LIBERTAD;23/11/2026 08:00;24/11/2026 08:00;Turnero noviembre 2026`}
        />
      </label>
      <button type="submit" className="boton w-fit">
        Importar turnero
      </button>
    </form>
  );
}