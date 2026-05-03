import { NextResponse } from "next/server";

/** Placeholder Fase 2 — verificación webhook Meta (GET) y eventos entrantes (POST). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verify = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === "subscribe" && verify && token === verify && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ ok: false, hint: "Configurá WHATSAPP_VERIFY_TOKEN en .env" }, { status: 403 });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: true,
      mensaje: "Webhook recibido — implementación de guardado de estados en Fase 2.",
    },
    { status: 200 },
  );
}
