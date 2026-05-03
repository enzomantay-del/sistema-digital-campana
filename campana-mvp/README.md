# Plataforma de campaña — MVP Fase 1

Aplicación **Next.js** con **Prisma** y **SQLite** en desarrollo: base de contactos por barrio, importación por texto, simulación de envíos masivos y panel con la misma línea visual que la propuesta comercial (azul / rojo).

## Requisitos

- Node.js 20+
- npm

## Arranque local

**No hay un solo archivo “para abrir” como un HTML:** esto es una aplicación que corre con Node.js. Tenés dos opciones:

### Opción A — Windows (doble clic)

1. Entrá a la carpeta `campana-mvp`.
2. **Doble clic** en **`iniciar-panel.bat`**.  
   La primera vez va a instalar dependencias y puede tardar varios minutos.
3. Se abre el navegador en `http://localhost:3000`. Si no pasa solo, abrilo vos a esa dirección.
4. **Una sola vez**, si la base está vacía y querés datos de prueba, con el servidor **cerrado** abrí `cmd` en esta carpeta y ejecutá: `npm run db:seed`

### Opción B — Terminal (manual)

```bash
cd campana-mvp
copy .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) → redirige al panel.

**Requisito:** tener [Node.js](https://nodejs.org) instalado (versión LTS recomendada).

## Scripts

| Comando | Uso |
|--------|-----|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build producción |
| `npm run db:migrate` | Migraciones Prisma |
| `npm run db:seed` | Datos de ejemplo |

## Fases

- **Fase 1 (actual):** modelo de datos, UI panel, simulación de envíos.
- **Fase 2:** WhatsApp Cloud API, webhooks en `/api/webhooks/whatsapp`, plantillas Meta.

## Producción

Usá PostgreSQL (por ejemplo Supabase), definí `DATABASE_URL` y ejecutá migraciones. El archivo SQLite `prisma/dev.db` es solo para desarrollo local.
