# Correo `@cercalud.com.ar` sin costo (NIC + Cloudflare)

En **NIC Argentina** solo administrás el dominio; **no** podés poner registros MX a mano. Para tener `contacto@cercalud.com.ar` gratis, lo habitual es:

1. **Delegar** el dominio a un DNS gratuito (recomendado: **Cloudflare**).
2. Activar **Email Routing** de Cloudflare (reenvío gratis).
3. Crear un **Gmail solo de Cercalud** (no tu mail personal) como bandeja donde llegan los mensajes.

Así el público ve `@cercalud.com.ar`; vos leés y respondés desde un Gmail dedicado. **No pagás** mailbox ni Google Workspace.

## Qué conviene crear

| Dirección | Uso |
|-----------|-----|
| `contacto@cercalud.com.ar` | Página **Contacto** del sitio (ya es el valor por defecto en la app). |
| `admin@cercalud.com.ar` | Opcional: mismo reenvío; usala como `ADMIN_EMAIL` en Secrets si querés separar lo administrativo. |

Podés reenviar las dos al **mismo** Gmail de Cercalud.

## Antes de empezar

- CUIT/CUIL y **clave fiscal nivel 2** del titular del dominio en [nic.ar](https://nic.ar).
- Cuenta gratuita en [Cloudflare](https://dash.cloudflare.com/sign-up).
- Un Gmail **nuevo** solo para el proyecto (ej. `cercalud.ar@gmail.com`).

**Importante:** Si ya tenés la web (`www.cercalud.com.ar`) apuntando a otro lado, anotá hoy los DNS actuales (desde el panel donde los manejes hoy) para copiarlos en Cloudflare y **no cortar el sitio**.

## Paso 1 — Agregar el dominio en Cloudflare

1. En Cloudflare: **Add a site** → `cercalud.com.ar` → plan **Free**.
2. Cloudflare escanea registros; si faltan, los cargás vos igual que en el proveedor anterior (CNAME/A de la web, etc.).
3. Cloudflare te da **dos servidores** de nombres, por ejemplo:
   - `ada.ns.cloudflare.com`
   - `bob.ns.cloudflare.com`

## Paso 2 — Delegar en NIC

1. [nic.ar](https://nic.ar) → **INGRESO** (CUIT/CUIL + clave fiscal).
2. **Trámites a distancia** → tu dominio → **DELEGAR**.
3. **Agregar una nueva delegación** para cada servidor de Cloudflare (solo el host, sin IP).
4. Borrá delegaciones viejas que ya no uses (si las hay).
5. **EJECUTAR CAMBIOS**. Puede tardar desde minutos hasta 24 h en propagarse.

## Paso 3 — Email Routing en Cloudflare

1. En Cloudflare: **Email** → **Email Routing** (o *Email Service* → *Email Routing*).
2. **Add records and enable** (Cloudflare pone los MX en tu zona).
3. **Destination address:** agregá tu Gmail de Cercalud y confirmá el mail de verificación que envía Cloudflare.
4. **Routing rules** → **Create address**:
   - Custom: `contacto@cercalud.com.ar` → reenviar al Gmail de Cercalud.
   - Repetí para `admin@` si querés.

Prueba enviando un mail **desde otro correo** a `contacto@cercalud.com.ar` y revisá el Gmail de Cercalud.

## Responder “como” `@cercalud.com.ar` (gratis vs pago)

| Opción | Costo | Qué pasa |
|--------|-------|----------|
| Reenvío (Cloudflare) | $0 | Te **llegan** los mails; al responder desde Gmail, el destinatario suele ver tu `@gmail.com` salvo que configures “Enviar correo como” (más engorroso sin SMTP pago). |
| Zoho Mail / Google Workspace | Pago o plan limitado | Bandeja y envío **desde** `@cercalud.com.ar` con mejor imagen profesional. |

Para arrancar, el reenvío alcanza: en la web ya mostrás `contacto@cercalud.com.ar` y la gente escribe ahí.

## Paso 4 — Cercalud (app publicada)

En **Secrets** de la app en Cursor (si querés que coincida con lo que creaste):

- `CERCALUD_CONTACTO_EMAIL` = `contacto@cercalud.com.ar`
- `ADMIN_EMAIL` = el correo con el que entrás como admin (puede ser `admin@cercalud.com.ar` o el mismo Gmail **solo si** registraste esa cuenta en Cercalud; lo normal es usar el mail de la cuenta de usuario admin que ya creaste en el seed).

El WhatsApp de contacto/recuperación sigue aparte (`CERCALUD_CONTACTO_WHATSAPP`).

## Alternativa sin Cloudflare

[Servicios de reenvío gratis](https://forwardemail.net/es) (Forward Email, ImprovMX, etc.) también sirven: delegás el dominio a su DNS o cargás sus MX donde tengas la zona. Cloudflare suele ser lo más simple si ya vas a usar su DNS para la web.

## Si algo falla

- **No llega el mail:** revisá que en Cloudflare los MX apunten a Cloudflare y que la delegación en NIC esté **Delegado: SI**.
- **Se cayó la web:** faltó copiar algún CNAME/A en Cloudflare antes de delegar.
- **NIC:** soporte en nic.ar o la documentación de **delegación** en su sitio.

Cuando tengas `contacto@` funcionando, avisá y revisamos Secrets y textos del sitio si hace falta.