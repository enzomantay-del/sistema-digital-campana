import { sincronizarBaseDatos } from "./sync-db.mjs";

/** Alinea el esquema Postgres con Prisma (manual; el deploy ya sincroniza si hay DATABASE_URL). */
sincronizarBaseDatos({ acceptDataLoss: true });