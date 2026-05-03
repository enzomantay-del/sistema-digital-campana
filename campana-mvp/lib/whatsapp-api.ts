import { getWhatsAppAccessToken, getWhatsAppApiVersion, getWhatsAppPhoneNumberId } from "./whatsapp-config";

/** Destinatario como lo espera Meta (solo dígitos, código país sin +). */
export function normalizarDestinatarioWa(raw: string): string {
  const d = raw.replace(/\D/g, "");
  return d;
}

export type SendTemplateResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string; status?: number; meta?: unknown };

/**
 * Envía un mensaje de plantilla aprobada por Meta.
 * @param bodyParameters Textos para variables {{1}}, {{2}}, … del cuerpo de la plantilla (opcional).
 */
export async function enviarPlantillaWhatsApp(params: {
  toE164OrDigits: string;
  templateName: string;
  languageCode: string;
  bodyParameters?: string[];
}): Promise<SendTemplateResult> {
  const token = getWhatsAppAccessToken();
  const phoneId = getWhatsAppPhoneNumberId();
  if (!token || !phoneId) {
    return { ok: false, error: "WhatsApp no configurado (token o phone ID)." };
  }

  const to = normalizarDestinatarioWa(params.toE164OrDigits);
  if (to.length < 10) {
    return { ok: false, error: "Teléfono inválido para WhatsApp." };
  }

  const version = getWhatsAppApiVersion();
  const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;

  const template: Record<string, unknown> = {
    name: params.templateName,
    language: { code: params.languageCode },
  };

  if (params.bodyParameters && params.bodyParameters.length > 0) {
    template.components = [
      {
        type: "body",
        parameters: params.bodyParameters.map((text) => ({
          type: "text",
          text,
        })),
      },
    ];
  }

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      messages?: { id?: string }[];
      error?: { message?: string; error_user_msg?: string; code?: number };
    };

    if (!res.ok) {
      const msg =
        data.error?.error_user_msg || data.error?.message || `HTTP ${res.status}`;
      return { ok: false, error: msg, status: res.status, meta: data };
    }

    const messageId = data.messages?.[0]?.id;
    if (!messageId) {
      return { ok: false, error: "Meta no devolvió wamid.", meta: data };
    }

    return { ok: true, messageId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de red";
    return { ok: false, error: msg };
  }
}
