# Migrar Cercalud de Cursor a Netlify (sin perder datos)

Guía ordenada. **No borres** la publicación en Cursor hasta verificar que Netlify funciona con la **misma base copiada**.

Sitio actual (referencia): **https://donde-atenderse.apps.grok.bot**

---

## Qué hay que preservar

| Recurso | Dónde está hoy | Cómo se migra |
|--------|----------------|---------------|
| Código | GitHub `sistema-digital-campana` / `donde-atenderse` | Netlify conecta el mismo repo |
| Base Postgres | Hosting Cursor (secreto `DATABASE_URL`) | **Volcado + restauración** en Postgres nuevo |
| Fotos y logos | Dentro de Postgres (sin S3 obligatorio) | Viajan con el volcado |
| Cuentas y fichas | Tablas `User`, `Professional`, `Place`, etc. | Idem |
| Secrets | Panel Cursor | Variables de entorno en Netlify |

---

## Fase 0 — Copia de seguridad (hacelo ya)

1. **Código** (en tu PC o en el agente):

   ```bash
   cd donde-atenderse
   chmod +x scripts/backup-proyecto.sh
   ./scripts/backup-proyecto.sh
   ```

2. **Base de datos** (en Cursor Publish **no** se muestra `DATABASE_URL`; usá el respaldo de la app):

   - Republicá la app con la versión que incluye **Administración → Descargar respaldo (.json.gz)**.
   - Entrá como **admin** → panel **Administración** → **Descargar respaldo**.
   - Guardá el archivo en tu PC (no lo subas a redes sociales ni a Git).

   Importar en **Neon** (base vacía, con la URL `postgresql://…` en tu bloc):

   ```bash
   cd donde-atenderse
   export DATABASE_URL="postgresql://…"   # la de Neon; no la pegues en chats públicos
   npm run db:restaurar-respaldo -- ~/Descargas/cercalud-respaldo-YYYY-MM-DD.json.gz
   ```

   Si no usás terminal, adjuntá el `.json.gz` en el chat del agente y cargá la URL de Neon como secret personal **`MIGRACION_DATABASE_URL`** (Cursor → configuración → Secrets).

   Alternativa técnica con `pg_dump`: `scripts/exportar-postgres.sh` solo si tenés la `DATABASE_URL` de origen.

3. Dejá **Cursor publicado** hasta el final de las pruebas en Netlify.

---

## Fase 1 — Postgres para Netlify

Netlify **no** incluye Postgres en el plan de 9 USD. Opciones habituales (todas sirven con Prisma):

- **[Neon](https://neon.tech)** (capa gratis generosa, recomendado para empezar)
- **Supabase** (Postgres + panel)
- **Tu propio VPS** con Postgres

Pasos:

1. Creá la base nueva en el proveedor elegido.
2. Restaurá el volcado:

   ```bash
   psql "$DATABASE_URL_NETLIFY" -f cercalud-antes-netlify.sql
   ```

   (O el asistente de import del proveedor.)

3. Después de restaurar, **una sola vez** (si el esquema del repo es más nuevo que el volcado):

   ```bash
   cd donde-atenderse
   export DATABASE_URL="postgresql://...netlify-neon..."
   npm run db:push:prod
   ```

   Solo si hace falta alinear columnas nuevas; revisá antes de usar `--accept-data-loss` en producción.

---

## Fase 2 — Sitio en Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → GitHub → repo `sistema-digital-campana`.
2. **Base directory**: `donde-atenderse`
3. Build settings (el repo ya trae `netlify.toml`):
   - Build command: `npm ci && npm run build`
   - Plugin: `@netlify/plugin-nextjs` (se instala con `npm ci`)
4. **No** definas `PRISMA_DB_PUSH=1` en variables de build salvo que quieras empujar esquema en cada deploy (no recomendado).

### Variables de entorno (Site settings → Environment variables)

Copiá desde Cursor Secrets (mismos valores):

| Variable | Obligatoria | Notas |
|----------|-------------|--------|
| `DATABASE_URL` | Sí | Postgres **nuevo** (ya con datos restaurados) |
| `AUTH_SECRET` | Sí | Mínimo 32 caracteres; **el mismo** que en Cursor para no invalidar sesiones |
| `ADMIN_EMAIL` | Sí | |
| `ADMIN_PASSWORD` | Sí | |
| `CERCALUD_SITE_URL` | Sí cuando tengas dominio | Ej. `https://www.cercalud.com.ar` o la URL `*.netlify.app` al probar |
| `CERCALUD_CONTACTO_WHATSAPP` | Recomendado | |
| `CERCALUD_CONTACTO_EMAIL` | Opcional | |
| `CERCALUD_MOSTRAR_EJEMPLOS` | No en prod | No definir o `0` |

Opcional S3/R2: ver [almacenamiento-imagenes.md](./almacenamiento-imagenes.md).

5. **Deploy site**. Revisá que cargue inicio, login admin y una ficha con foto.

---

## Fase 3 — Dominio (`cercalud.com.ar`)

Mientras probás, usá `https://<tu-sitio>.netlify.app`.

Cuando esté bien:

1. Netlify → **Domain management** → agregar `www.cercalud.com.ar`.
2. En **Cloudflare** (ver [dominio-cercalud.md](./dominio-cercalud.md)): CNAME `www` → el host que indique Netlify (no el de `apps.grok.bot`).
3. Redirección apex `cercalud.com.ar` → `https://www.cercalud.com.ar`.
4. Actualizá `CERCALUD_SITE_URL` en Netlify y **redeploy**.

No saques el DNS de Cursor hasta que `www` apunte a Netlify y todo funcione.

---

## Fase 4 — Corte y congelado en Cursor

Checklist antes de apagar Cursor:

- [ ] Login admin y profesional en Netlify
- [ ] Búsqueda, ficha pública, fotos visibles
- [ ] Guardar ficha de prueba (escritura en Postgres nuevo)
- [ ] Volcado **nuevo** de la base en Neon por si acaso
- [ ] Dominio apunta a Netlify

Después podés **unpublish** en Cursor o dejarlo como respaldo de solo lectura unos días.

---

## Comportamiento del build (importante)

Desde esta versión:

- `npm run build` **no** ejecuta `prisma db push` salvo `PRISMA_DB_PUSH=1`.
- Alineación manual de esquema: `npm run db:push:prod` con `DATABASE_URL` cargada.
- El arranque tipo `npm run start` (servidor propio) solo hace push si `PRISMA_DB_PUSH_ON_START=1`.

En **Cursor**, si seguís publicando temporalmente, podés agregar el secret `PRISMA_DB_PUSH=1` solo cuando cambió `schema.postgres.prisma`.

---

## Problemas frecuentes

| Síntoma | Qué hacer |
|---------|-----------|
| Login no funciona | `AUTH_SECRET` distinto al de Cursor |
| Fichas vacías | `DATABASE_URL` apunta a base vacía; restaurá el volcado |
| Fotos rotas | Verificá que restauraste la misma base; sin S3, todo está en Postgres |
| Error en build Netlify | Revisá logs; `NODE_VERSION=20`; base directory `donde-atenderse` |
| SSL / dominio | Esperá propagación DNS; SSL lo gestiona Netlify o Cloudflare |

---

## Qué pedir si trabás con el agente

1. Confirmación de que tenés volcado SQL guardado en un lugar seguro.
2. Proveedor Postgres elegido (Neon / Supabase / otro).
3. URL de preview `*.netlify.app` cuando el primer deploy termine.