import Link from "next/link";
import { MENSAJE_WHATSAPP } from "@/lib/constants";
import { enlaceWhatsApp } from "@/lib/format";
import type { VistaProfesional } from "@/lib/view";

export function FichaProfesional({
  vista,
  ejemplo = false,
  enlazar = true,
}: {
  vista: VistaProfesional;
  ejemplo?: boolean;
  enlazar?: boolean;
}) {
  return (
    <article className="tarjeta grid gap-8">
      <header className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-accent">
          {vista.especialidad} · {vista.area}
        </p>
        <h1 className="text-4xl font-bold tracking-tight">{vista.nombre}</h1>
        {vista.matricula ? <p>Matrícula {vista.matricula}</p> : null}
        {ejemplo ? <p className="text-base text-warn">Dato de ejemplo.</p> : null}
      </header>

      {vista.bloques.length === 0 ? (
        <p>Todavía no cargó dónde atiende.</p>
      ) : (
        <div className="grid gap-6">
          {vista.bloques.map((bloque) => (
            <section key={bloque.shift} className="grid gap-4">
              <h2 className="text-2xl font-semibold">{bloque.titulo}</h2>
              {bloque.shift === "guardia" ? (
                <p className="text-base text-muted">Es una guardia, no un horario de consultorio.</p>
              ) : null}
              {bloque.lineas.map((linea) => (
                <div key={linea.id} className="border-t border-line pt-4">
                  {enlazar ? (
                    <Link href={`/lugar/${linea.placeId}`} className="text-xl font-semibold text-link">
                      {linea.rotulo}
                    </Link>
                  ) : (
                    <p className="text-xl font-semibold">{linea.rotulo}</p>
                  )}
                  <p className="text-muted">{linea.locality}</p>
                  {linea.detalle ? <p className="mt-1">{linea.detalle}</p> : null}
                  <p className="mt-2 text-base text-muted">{linea.actualizacion}</p>
                  {linea.conflictoTexto ? <p className="mt-1 text-base text-warn">{linea.conflictoTexto}</p> : null}
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      {vista.obras.length > 0 ? (
        <p>
          <span className="text-muted">Obra social: </span>
          {vista.obras.join(" · ")}
        </p>
      ) : null}

      {vista.precio ? (
        <p>
          Precio de la consulta: {vista.precio}.
          {vista.precioFecha ? ` Lo escribió el ${vista.precioFecha}.` : ""}
        </p>
      ) : null}

      {vista.telefono ? <p>Teléfono {vista.telefono}</p> : null}

      {vista.whatsapp ? (
        ejemplo ? (
          <p className="boton w-fit cursor-default opacity-80">Escribir por WhatsApp</p>
        ) : (
          <a className="boton w-fit" href={enlaceWhatsApp(vista.whatsapp, MENSAJE_WHATSAPP)}>
            Escribir por WhatsApp
          </a>
        )
      ) : (
        <p className="text-muted">Todavía no hay un WhatsApp cargado.</p>
      )}
      {ejemplo && vista.whatsapp ? (
        <p className="text-base text-muted">En una ficha real, este botón abre el chat.</p>
      ) : null}

      <p className="text-base text-muted">{vista.actualizacion}</p>
    </article>
  );
}
