import Link from "next/link";
import { guardarReferenciaAcceso } from "@/actions/adminAccesos";

export type FilaAccesoAdmin = {
  id: string;
  name: string;
  email: string;
  role: string;
  whatsapp: string;
  contrasenaReferencia: string;
  notaAcceso: string;
  createdAt: Date;
  lugares: { name: string; locality: string; kind: string }[];
  professionalId: string | null;
  professionalName: string | null;
};

function etiquetaRol(rol: string) {
  if (rol === "secretaria") return "Secretaría";
  if (rol === "profesional") return "Profesional";
  return rol;
}

export function RegistroAccesosAdmin({ filas }: { filas: FilaAccesoAdmin[] }) {
  if (filas.length === 0) {
    return (
      <p className="text-sm text-muted">
        Todavía no hay cuentas de secretaría o profesional. Cuando creés una abajo, el correo y la contraseña quedan
        guardados acá.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="rounded-xl border border-amber-200/90 bg-amber-50 px-3 py-2 text-sm text-ink">
        Solo vos ves esta lista en administración. Usala para recordar qué contraseña le diste a cada lugar o
        profesional. Si alguien cambia la suya en el panel, actualizá el campo «Contraseña de referencia».
      </p>
      <ul className="grid gap-3">
        {filas.map((fila) => (
          <li key={fila.id} className="rounded-2xl border border-line bg-white p-3 sm:p-4">
            <div className="mb-3 grid gap-1">
              <p className="font-semibold text-ink">
                {fila.name}
                <span className="font-normal text-muted"> · {etiquetaRol(fila.role)}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted">Correo: </span>
                <span className="font-medium text-ink">{fila.email}</span>
              </p>
              {fila.whatsapp ? (
                <p className="text-sm text-muted">WhatsApp: {fila.whatsapp}</p>
              ) : null}
              {fila.lugares.length > 0 ? (
                <p className="text-sm text-muted">
                  Lugares:{" "}
                  {fila.lugares
                    .map((l) => `${l.name} (${l.locality})`)
                    .join(" · ")}
                </p>
              ) : null}
              {fila.professionalId ? (
                <p className="text-sm">
                  <Link href={`/panel/admin/profesional/${fila.professionalId}`} className="font-semibold text-link">
                    Ficha: {fila.professionalName ?? fila.name}
                  </Link>
                </p>
              ) : null}
            </div>
            <form action={guardarReferenciaAcceso} className="grid gap-2 border-t border-line pt-3">
              <input type="hidden" name="userId" value={fila.id} />
              <label className="grid gap-1 text-sm">
                Contraseña de referencia (la que les pasaste)
                <input
                  name="contrasenaReferencia"
                  className="campo font-mono text-sm"
                  defaultValue={fila.contrasenaReferencia}
                  placeholder="Ej. la que definiste al crear la cuenta"
                  autoComplete="off"
                />
              </label>
              <label className="grid gap-1 text-sm">
                Nota (opcional)
                <input
                  name="notaAcceso"
                  className="campo text-sm"
                  defaultValue={fila.notaAcceso}
                  placeholder="Ej. Recepción Hospital X — María"
                />
              </label>
              <button type="submit" className="boton-suave w-fit text-sm">
                Guardar referencia
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}