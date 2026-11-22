"use client";

import { useActionState } from "react";
import { importarTurnero, type ResultadoImportarTurnero } from "@/actions/turnero";

export function ImportarTurneroFarmacia() {
  const [estado, accion, pendiente] = useActionState<ResultadoImportarTurnero | null, FormData>(importarTurnero, null);

  return (
    <form action={accion} className="tarjeta grid max-w-2xl gap-4 text-left">
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold">Turnero de farmacias</h2>
        <p className="text-sm text-muted">
          Los turnos los carga Cercalud desde la planilla oficial. Vos publicás las farmacias; acá importamos inicio y fin con
          hora exacta (hora de Misiones). Formato por fila: localidad; nombre; inicio; fin; fuente.
        </p>
      </div>
      <label className="grid gap-1 text-sm">
        Archivo CSV o TXT
        <input name="archivo" type="file" accept=".csv,.txt,text/csv,text/plain" className="campo" />
      </label>
      <label className="grid gap-1 text-sm">
        O pegá las filas acá
        <textarea
          name="texto"
          className="campo min-h-28 font-mono text-xs"
          placeholder={`Jardín América;Farmacia Libertad;22/11/2025 08:00;23/11/2025 08:00;Turnero municipal`}
        />
      </label>
      <button type="submit" className="boton w-fit" disabled={pendiente}>
        {pendiente ? "Importando…" : "Importar turnero"}
      </button>
      {estado?.ok === false ? <p className="text-sm text-warn">{estado.error}</p> : null}
      {estado?.ok ? (
        <div className="grid gap-1 text-sm">
          <p className="text-menta">Se cargaron {estado.cargados} turno{estado.cargados === 1 ? "" : "s"}.</p>
          {estado.sinCoincidencia.length > 0 ? (
            <p className="text-warn">
              Sin farmacia publicada con ese nombre: {estado.sinCoincidencia.slice(0, 5).join(" · ")}
              {estado.sinCoincidencia.length > 5 ? ` (+${estado.sinCoincidencia.length - 5})` : ""}
            </p>
          ) : null}
          {estado.invalidas.length > 0 ? <p className="text-warn">{estado.invalidas.join(" · ")}</p> : null}
        </div>
      ) : null}
    </form>
  );
}