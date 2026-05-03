# Plataforma de campaña — MVP Fase 1

Aplicación **Next.js** con **Prisma** y **SQLite** en desarrollo: base de contactos por barrio, importación por texto, simulación de envíos masivos y panel con la misma línea visual que la propuesta comercial (azul / rojo).

## Requisitos

- Node.js 20+
- npm

## Arranque local

```bash
cd campana-mvp
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) → redirige al panel.

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
