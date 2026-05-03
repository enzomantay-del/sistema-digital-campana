import Link from "next/link";

const items = [
  { href: "/panel", label: "Inicio", icon: "📊", desc: "Resumen y métricas" },
  { href: "/panel/contactos", label: "Contactos", icon: "👥", desc: "Base por barrio" },
  { href: "/panel/envios", label: "Envíos", icon: "💬", desc: "Lotes y simulación" },
  { href: "/panel/config", label: "Configuración", icon: "⚙️", desc: "WhatsApp (pronto)" },
];

export function Sidebar() {
  return (
    <aside className="flex w-full flex-col border-b border-slate-200/80 bg-white shadow-panel lg:h-screen lg:min-h-screen lg:sticky lg:top-0 lg:border-b-0 lg:border-r lg:w-64 lg:shrink-0">
      <div className="border-b border-slate-100 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-campana-rojo">MVP · Fase 1</p>
        <h1 className="mt-1 text-lg font-bold leading-tight text-campana-azul">
          Plataforma de campaña
        </h1>
        <p className="mt-2 text-xs text-slate-500">
          Datos + panel. WhatsApp Cloud API en siguiente iteración.
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-slate-50"
          >
            <span className="text-lg leading-none" aria-hidden>
              {item.icon}
            </span>
            <span>
              <span className="block font-semibold text-campana-azul group-hover:text-campana-azul-med">
                {item.label}
              </span>
              <span className="text-xs text-slate-500">{item.desc}</span>
            </span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-4 text-[11px] leading-snug text-slate-400">
        Plantilla reutilizable: adaptá nombre del distrito y marca cuando corresponda.
      </div>
    </aside>
  );
}
