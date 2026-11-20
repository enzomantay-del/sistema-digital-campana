import Link from "next/link";
import { MENSAJE_WHATSAPP } from "@/lib/constants";
import { enlaceMaps, enlaceTelefono, enlaceWhatsApp, etiquetaLugar } from "@/lib/format";
import type { VistaLugar } from "@/lib/view";

export function FichaLugar({
  vista,
  ejemplo = false,
  enlazar = true,
}: {
  vista: VistaLugar;
  ejemplo?: boolean;
  enlazar?: boolean;
}) {
  return (
    <article className="tarjeta grid gap-8">
      <header className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-menta">
          {etiquetaLugar(vista.kind)} · {vista.localidad}
        </p>
        <h1 className="text-4xl font-bold tracking-tight">{vista.nombre}</h1>
        {vista.direccion ? (
          ejemplo ? (
            <p>{vista.direccion}</p>
          ) : (
            <a
              href={enlaceMaps(vista.direccion, vista.localidad, vista.nombre)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit font-medium text-link underline-offset-2 hover:underline"
            >
              {vista.direccion}
            </a>
          )
        ) : null}
        {vista.notaHospital ? <p className="text-base text-muted">{vista.notaHospital}</p> : null}
        {ejemplo ? <p className="text-base text-warn">Dato de ejemplo.</p> : null}
      </header>

      {vista.horarioLineas.length > 0 ? (
        <div className="grid gap-1">
          {vista.horarioLineas.map((linea) => (
            <p key={linea}>{linea}</p>
          ))}
        </div>
      ) : vista.horarioLugar ? (
        <p>{vista.horarioLugar}</p>
      ) : null}

      {vista.bloques.length > 0 ? (
        <div className="grid gap-6">
          <h2 className="text-2xl font-semibold">Quién atiende</h2>
          {vista.bloques.map((bloque) => (
            <section key={bloque.shift} className="grid gap-4">
              <h3 className="text-xl font-semibold">{bloque.titulo}</h3>
              {bloque.shift === "guardia" ? (
                <p className="text-base text-muted">Es una guardia, no un horario de consultorio.</p>
              ) : null}
              {bloque.lineas.map((linea) => (
                <div key={linea.id} className="border-t border-line pt-4">
                  {enlazar && linea.personaId ? (
                    <Link href={`/profesional/${linea.personaId}`} className="text-xl font-semibold text-link">
                      {linea.rotulo}
                    </Link>
                  ) : (
                    <p className="text-xl font-semibold">{linea.rotulo}</p>
                  )}
                  {linea.detalle ? <p className="mt-1">{linea.detalle}</p> : null}
                  <p className="mt-2 text-base text-muted">{linea.actualizacion}</p>
                  {linea.conflictoTexto ? <p className="mt-1 text-base text-warn">{linea.conflictoTexto}</p> : null}
                </div>
              ))}
            </section>
          ))}
        </div>
      ) : null}

      {vista.cantidadProfesionales > 0 ? (
        <div className="flex flex-wrap gap-3">
          <Link href={`/lugar/${vista.placeId}/profesionales`} className="boton-suave">
            Ver profesionales ({vista.cantidadProfesionales})
          </Link>
          {vista.especialidades.length > 0 ? (
            <Link href={`/lugar/${vista.placeId}/especialidades`} className="boton-suave">
              Ver especialidades ({vista.especialidades.length})
            </Link>
          ) : null}
        </div>
      ) : null}

      {vista.estudios.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-2xl font-semibold">Estudios</h2>
          {vista.estudios.map((estudio) => (
            <div key={estudio.nombre} className="border-t border-line pt-3">
              <p className="font-semibold">{estudio.nombre}</p>
              {estudio.atencion ? <p>{estudio.atencion}</p> : null}
              {estudio.preparacion ? <p className="text-muted">{estudio.preparacion}</p> : null}
            </div>
          ))}
        </section>
      ) : null}

      {vista.obrasNota ? <p className="text-sm text-muted">{vista.obrasNota}</p> : null}
      {vista.mostrarObrasLista && vista.obras.length > 0 ? (
        <p>
          <span className="text-muted">Obra social: </span>
          {vista.obras.join(" · ")}
        </p>
      ) : null}

      {vista.whatsapp || vista.telefono ? (
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold">Contacto</h2>
          <div className="flex flex-wrap gap-3">
            {vista.whatsapp ? (
              ejemplo ? (
                <span className="boton w-fit cursor-default opacity-80">WhatsApp</span>
              ) : (
                <a className="boton w-fit" href={enlaceWhatsApp(vista.whatsapp, MENSAJE_WHATSAPP)} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              )
            ) : null}
            {vista.telefono ? (
              ejemplo ? (
                <span className="boton-suave w-fit cursor-default opacity-80">Teléfono fijo</span>
              ) : (
                <a className="boton-suave w-fit" href={enlaceTelefono(vista.telefono)}>
                  Teléfono fijo
                </a>
              )
            ) : null}
          </div>
        </section>
      ) : null}
      <p className="text-base text-muted">{vista.actualizacion}</p>
    </article>
  );
}
