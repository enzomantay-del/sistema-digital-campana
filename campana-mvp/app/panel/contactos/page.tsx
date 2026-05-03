import { prisma } from "@/lib/prisma";
import { FormNuevoContacto } from "./FormNuevo";
import { BotonEliminar } from "./BotonEliminar";
import { ImportarBloque } from "./ImportarBloque";

export default async function ContactosPage() {
  const rows = await prisma.contacto.findMany({ orderBy: { creadoEn: "desc" } });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-campana-azul">Contactos territoriales</h2>
        <p className="mt-1 text-sm text-slate-600">
          Base propia segmentable por barrio. Los teléfonos se normalizan al guardar (formato Argentina básico).
        </p>
      </div>

      <FormNuevoContacto />
      <ImportarBloque />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="font-semibold text-campana-azul">Listado ({rows.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Teléfono</th>
                <th className="px-4 py-3 font-semibold">Barrio</th>
                <th className="px-4 py-3 font-semibold">Notas</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No hay contactos. Usá el formulario o importá desde texto / ejecutá{" "}
                    <code className="rounded bg-slate-100 px-1">npm run db:seed</code>.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.nombre}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{c.telefono}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-campana-azul">
                        {c.barrio}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">{c.notas || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <BotonEliminar id={c.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
