import { sincronizarBaseDatos } from "./sync-db.mjs";

/** Alinea el esquema Postgres con Prisma (manual; no corre en cada deploy de Netlify). */
sincronizarBaseDatos();