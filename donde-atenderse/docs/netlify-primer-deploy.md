# Primer deploy en Netlify (después de Neon)

Neon ya tiene los datos. Seguí este orden en **[app.netlify.com](https://app.netlify.com)**.

## 1 — Nuevo sitio desde GitHub

1. **Add new site** → **Import an existing project** → **GitHub**.
2. Si pide permiso, autorizá el repo **`enzomantay-del/sistema-digital-campana`**.
3. **Branch to deploy:** `cursor/donde-atenderse-77b7` (hasta mergear el PR a `main`; después podés cambiar a `main`).
4. **Base directory:** vacío en la UI (el repo tiene `netlify.toml` en la raíz con `base = "donde-atenderse"` y `publish = ".next"`).
5. Si la UI no deja editar **Publish directory**, no importa: el archivo del repo manda. Hacé un deploy del último commit de la rama.

Clic en **Deploy site** solo después del paso 2 (variables), o configurá variables antes del primer build en **Site configuration → Environment variables**.

## 2 — Variables de entorno

**Site configuration → Environment variables → Add a variable** (scope: **All** — build y runtime).

| Variable | Dónde sacar el valor |
|----------|---------------------|
| `DATABASE_URL` | Neon → **Connect** → cadena **Pooled** `postgresql://…` (la misma del bloc; no la compartas en chats) |
| `AUTH_SECRET` | El mismo que usa la app en Cursor (mín. 32 caracteres) |
| `ADMIN_EMAIL` | Igual que en Cursor |
| `ADMIN_PASSWORD` | Igual que en Cursor |
| `CERCALUD_SITE_URL` | Al probar: dejalo vacío o pondremos `https://TU-SITIO.netlify.app` tras el primer deploy |
| `CERCALUD_CONTACTO_WHATSAPP` | Opcional, mismo valor que quieras en el sitio |

No hace falta `PRISMA_DB_PUSH=1`: con `DATABASE_URL` en Netlify, el build alinea la base sola. Solo si querés desactivarlo: `PRISMA_DB_PUSH=0`.

Opcional después: contacto email, S3 (`CERCALUD_S3_*`), ver [netlify-migracion.md](./netlify-migracion.md).

## 3 — Primer deploy

1. **Deploys** → esperá **Published** (verde).
2. Abrí la URL `https://random-name.netlify.app`.
3. Probá: inicio, buscar, **entrar** como admin, abrir una ficha con foto.

## 4 — Nombre del sitio (opcional)

**Site configuration → Site details → Change site name** → ej. `cercalud` → URL `https://cercalud.netlify.app`.

Actualizá `CERCALUD_SITE_URL` con esa URL y **Trigger deploy** → **Clear cache and deploy site**.

## 5 — Dominio propio (más adelante)

Ver [dominio-cercalud.md](./dominio-cercalud.md) y fase 3 de [netlify-migracion.md](./netlify-migracion.md).

## 6 — Apagar Cursor (solo cuando todo funcione)

Checklist en [netlify-migracion.md](./netlify-migracion.md) fase 4.