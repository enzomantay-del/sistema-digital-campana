export default function ConfigPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-campana-azul">Configuración</h2>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">WhatsApp Cloud API (Meta) — próxima fase</p>
        <p className="mt-2 leading-relaxed">
          Acá vas a cargar el token de la app, el ID del número y el verify token del webhook. Por ahora el
          sistema funciona en modo <strong>desarrollo local</strong> con base SQLite y envíos{" "}
          <strong>simulados</strong>.
        </p>
        <p className="mt-3 text-xs text-amber-900/80">
          Variables previstas: <code className="rounded bg-amber-100/80 px-1">WHATSAPP_TOKEN</code>,{" "}
          <code className="rounded bg-amber-100/80 px-1">WHATSAPP_PHONE_ID</code>,{" "}
          <code className="rounded bg-amber-100/80 px-1">WHATSAPP_VERIFY_TOKEN</code>.
        </p>
      </div>
    </div>
  );
}
