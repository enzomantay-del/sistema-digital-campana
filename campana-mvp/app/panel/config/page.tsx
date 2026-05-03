export default function ConfigPage() {
  const urlBase =
    typeof process.env.NEXT_PUBLIC_APP_URL === "string"
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : "https://TU_DOMINIO";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold text-campana-azul">Configuración · WhatsApp Cloud API</h2>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
        <h3 className="font-semibold text-campana-azul">1. Variables en `.env`</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Copiá <code className="rounded bg-slate-100 px-1">.env.example</code> a{" "}
          <code className="rounded bg-slate-100 px-1">.env</code> y completá:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700">
          <li>
            <code className="rounded bg-slate-100 px-1">WHATSAPP_ACCESS_TOKEN</code> — token de acceso del número
            (Graph API).
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1">WHATSAPP_PHONE_NUMBER_ID</code> — ID del número de WhatsApp
            Business.
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1">WHATSAPP_VERIFY_TOKEN</code> — texto secreto que vos elegís;
            debe coincidir con lo que cargás en Meta al registrar el webhook.
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1">WHATSAPP_APP_SECRET</code> (recomendado en producción) —
            para validar firma <code className="rounded bg-slate-100 px-1">X-Hub-Signature-256</code> en el webhook.
          </li>
          <li>
            Opcional: <code className="rounded bg-slate-100 px-1">WHATSAPP_DEFAULT_TEMPLATE</code>,{" "}
            <code className="rounded bg-slate-100 px-1">WHATSAPP_DEFAULT_TEMPLATE_LANG</code>,{" "}
            <code className="rounded bg-slate-100 px-1">WHATSAPP_API_VERSION</code> (por defecto{" "}
            <code className="rounded bg-slate-100 px-1">v21.0</code>).
          </li>
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          Alias soportados: <code className="rounded bg-slate-100 px-1">WHATSAPP_TOKEN</code> y{" "}
          <code className="rounded bg-slate-100 px-1">WHATSAPP_PHONE_ID</code> si ya los tenías nombrados así.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
        <h3 className="font-semibold text-campana-azul">2. Webhook (URL de tu servidor)</h3>
        <p className="mt-2 text-sm text-slate-600">
          En Meta Developers → tu app → WhatsApp → Configuration, cargá la URL del webhook:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-sm text-emerald-300">
          {`${urlBase}/api/webhooks/whatsapp`}
        </pre>
        <p className="mt-3 text-sm text-slate-600">
          Para desarrollo local podés usar{" "}
          <a
            className="font-medium text-campana-azul-med underline"
            href="https://ngrok.com/"
            target="_blank"
            rel="noreferrer"
          >
            ngrok
          </a>{" "}
          y poner la URL https que te da en lugar de <code className="rounded bg-slate-100 px-1">TU_DOMINIO</code>.
          Definí <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_APP_URL</code> en{" "}
          <code className="rounded bg-slate-100 px-1">.env</code> si querés que esta pantalla muestre tu base exacta.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">Plantillas y políticas</p>
        <p className="mt-2 leading-relaxed">
          Solo podés enviar <strong>plantillas aprobadas</strong>. Probá primero con la plantilla de prueba{" "}
          <code className="rounded bg-amber-100/80 px-1">hello_world</code> e idioma{" "}
          <code className="rounded bg-amber-100/80 px-1">en_US</code>. Las variables del cuerpo deben coincidir con
          lo definido en Meta.
        </p>
      </div>
    </div>
  );
}
