import { prisma } from "@/lib/prisma";
import { FormSimularEnvio } from "./FormSimular";

export default async function EnviosPage() {
  const barrios = await prisma.contacto.findMany({
    distinct: ["barrio"],
    select: { barrio: true },
    orderBy: { barrio: "asc" },
  });

  const envios = await prisma.envio.findMany({
    orderBy: { creadoEn: "desc" },
    include: { _count: { select: { mensajes: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-campana-azul">Envíos</h2>
        <p className="mt-1 text-sm text-slate-600">
          Cada fila es un lote. En esta fase los mensajes son <strong>simulados</strong> para validar el modelo de datos
          y el panel antes de conectar la API de WhatsApp.
        </p>
      </div>

      <FormSimularEnvio barrios={barrios.map((b) => b.barrio)} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="font-semibold text-campana-azul">Historial de lotes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Filtro barrio</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Mensajes</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {envios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Todavía no registraste envíos. Simulá uno arriba.
                  </td>
                </tr>
              ) : (
                envios.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-800">{e.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{e.filtroBarrio ?? "— Todos —"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        {e.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{e._count.mensajes}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {e.creadoEn.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
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
