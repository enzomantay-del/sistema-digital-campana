import { StatCard } from "@/components/panel/StatCard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PanelInicioPage() {
  const totalContactos = await prisma.contacto.count();
  const totalEnvios = await prisma.envio.count();
  const porBarrio = await prisma.contacto.groupBy({
    by: ["barrio"],
    _count: { id: true },
    orderBy: { barrio: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header className="rounded-2xl bg-gradient-to-br from-campana-azul via-campana-azul-med to-campana-azul-claro p-8 text-white shadow-panel">
        <p className="text-sm font-medium text-white/80">Panel operativo</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Controlá la base y los envíos desde un solo lugar
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85">
          Fase 1: cargá contactos por barrio, importá planillas y simulá envíos para ver cómo quedaría
          registrado cada mensaje. La integración real con WhatsApp Cloud API viene en la próxima etapa.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/panel/contactos"
            className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-campana-azul shadow hover:bg-slate-50"
          >
            Ir a contactos →
          </Link>
          <Link
            href="/panel/envios"
            className="inline-flex items-center rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
          >
            Simular envío
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard titulo="Contactos en base" valor={totalContactos} subtitulo="Vecinos y referentes cargados" />
        <StatCard
          titulo="Envíos registrados"
          valor={totalEnvios}
          subtitulo="Lotes (simulados o reales más adelante)"
          acento="rojo"
        />
        <StatCard
          titulo="Barrios distintos"
          valor={porBarrio.length}
          subtitulo="Segmentación territorial"
        />
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-panel">
        <h3 className="text-lg font-bold text-campana-azul">Contactos por barrio</h3>
        <p className="mt-1 text-sm text-slate-600">
          Vista rápida para coordinar timbreo y mensajes segmentados.
        </p>
        {porBarrio.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Todavía no hay datos. Ejecutá el seed o importá contactos.</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {porBarrio.map((row) => (
              <li
                key={row.barrio}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
              >
                <span className="font-medium text-campana-azul">{row.barrio}</span>
                <span className="tabular-nums font-semibold text-slate-700">{row._count.id}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
