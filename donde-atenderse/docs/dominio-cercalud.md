# Conectar `cercalud.com.ar` a la web publicada en Cursor

La app vive hoy en **https://donde-atenderse.apps.grok.bot**. El dominio está en **NIC** y todavía no apunta a ningún lado: hay que hacer **dos cosas en orden**: pedir el dominio en Cursor y delegar/cargar el DNS (recomendado: **Cloudflare**, gratis).

Usá **`www.cercalud.com.ar`** como dirección principal; **`cercalud.com.ar`** (sin www) puede redirigir al www.

---

## Resumen (checklist)

- [ ] Cuenta gratis en [Cloudflare](https://dash.cloudflare.com/sign-up).
- [ ] Agregar el sitio `cercalud.com.ar` en Cloudflare (plan Free).
- [ ] En **NIC**: delegar el dominio a los dos servidores de nombres de Cloudflare.
- [ ] En **Cursor**: app **donde-atenderse** → **Publish** / configuración de la app → pestaña **Domain** → agregar `www.cercalud.com.ar` y copiar el **CNAME** que muestra (es distinto por app; no inventes uno).
- [ ] En **Cloudflare DNS**: crear el registro que Cursor indica (casi siempre `CNAME` de `www` → destino de Cursor).
- [ ] En **Cloudflare**: redirigir `cercalud.com.ar` → `https://www.cercalud.com.ar`.
- [ ] Esperar estado **Connected** / verde en Cursor (puede tardar 5–60 min, a veces hasta 24 h).
- [ ] En **Secrets** de la app: `CERCALUD_SITE_URL` = `https://www.cercalud.com.ar` y **republish**.
- [ ] Probar en el celular: `https://www.cercalud.com.ar` y `https://cercalud.com.ar`.

Después podés seguir con el correo en [correo-cercalud.md](./correo-cercalud.md) en el **mismo** Cloudflare (web + Email Routing).

---

## Paso 1 — Cloudflare (DNS del dominio)

1. Entrá a Cloudflare → **Add a site** → `cercalud.com.ar` → plan **Free**.
2. Cloudflare muestra dos servidores, por ejemplo:
   - `xxxx.ns.cloudflare.com`
   - `yyyy.ns.cloudflare.com`
3. **Todavía no hace falta** cargar registros de la web hasta tener el CNAME de Cursor (paso 3).

---

## Paso 2 — Delegar en NIC Argentina

1. [nic.ar](https://nic.ar) → **INGRESO** (CUIT/CUIL + clave fiscal nivel 2).
2. **Trámites a distancia** → tu dominio `cercalud.com.ar` → **DELEGAR**.
3. **Agregar una nueva delegación** para **cada** servidor de Cloudflare (campo Host; IPv4/IPv6 vacíos).
4. Si había delegaciones viejas sin uso, borralas.
5. **EJECUTAR CAMBIOS**. En la lista debería quedar **Delegado: SI**.

Hasta que esto no propague, Cursor no podrá verificar el dominio.

---

## Paso 3 — Dominio en Cursor (vos en la interfaz)

1. En Cursor, abrí el chat o el panel de la app **donde-atenderse** (la que publicaste como Cercalud).
2. Entrá a la configuración de la app publicada (botón **Publish** / pastilla de la app / Apps en el dashboard).
3. Pestaña **Domain** (o *Dominio*).
4. Agregá: **`www.cercalud.com.ar`**.
5. Cursor muestra algo del estilo:
   - Tipo: **CNAME**
   - Nombre: `www`
   - Destino: un host **propio de tu app** (termina en algo como `apps.grok.bot` u otro que te den).
6. **Copiá ese destino exacto** (screenshot o pegarlo en un bloc).

Si solo ves `donde-atenderse.apps.grok.bot` como URL del sitio y **no** ves pestaña Domain, actualizá Cursor o buscá *Apps* → tu app → *Settings* → *Custom domain*. Si no aparece, escribinos en el chat del agente con captura de pantalla y vemos plan B (host externo).

---

## Paso 4 — Registros DNS en Cloudflare

1. **DNS** → **Records** → **Add record**:
   - Type: **CNAME**
   - Name: **www**
   - Target: el destino **exacto** que dio Cursor (pegar sin cambiar).
   - Proxy status: **Proxied** (nube naranja) suele ir bien para HTTPS automático.
2. **Redirección del dominio sin www** (elegí una):
   - **Rules** → **Redirect Rules** → redirigir `cercalud.com.ar` → `https://www.cercalud.com.ar` (301), o
   - **Rules** → **Page Rules** / **Single Redirect** según tu panel.

No agregues MX de correo todavía si no configuraste Email Routing; eso va en el doc de correo.

3. Volvé a Cursor y esperá **Connected** en el dominio.

---

## Paso 5 — Secret y republicación

Cuando `https://www.cercalud.com.ar` abra la misma web:

1. En **Secrets** de la app (panel de Cursor):
   - `CERCALUD_SITE_URL` = `https://www.cercalud.com.ar`
2. **Publish** de nuevo para que el sitemap y enlaces internos usen el dominio nuevo.

El valor por defecto en código sigue siendo la URL `apps.grok.bot` hasta que cargues el secret.

---

## Problemas frecuentes

| Síntoma | Qué revisar |
|--------|-------------|
| Cursor no verifica | Delegación NIC → Cloudflare activa; CNAME `www` correcto; esperá propagación. |
| Error SSL | Dejá proxy naranja en Cloudflare o seguí lo que pida Cursor. |
| Solo funciona `apps.grok.bot` | Falta Domain conectado o DNS mal copiado. |
| `cercalud.com.ar` no abre pero `www` sí | Falta redirección del apex (paso 4). |

---

## Qué necesitamos del agente si te trabás

Pegá en el chat (sin datos sensibles):

1. Captura de la pestaña **Domain** de Cursor (con el CNAME destino).
2. Si NIC dice **Delegado: SI**.
3. El error exacto que ves al abrir `www.cercalud.com.ar`.

Con el CNAME podemos revisar si el registro en Cloudflare está bien escrito.