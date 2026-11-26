import { execSync } from "node:child_process";
import { schemaPrisma, usaPostgres } from "./prisma-runtime.mjs";

/**
 * Alinea Postgres con `schema.postgres.prisma`.
 * Por defecto sin `--accept-data-loss` (solo agrega columnas / cambios seguros).
 * El script manual `npm run db:push:prod` puede pasar `{ acceptDataLoss: true }`.
 */
export function sincronizarBaseDatos(opciones = {}) {
  if (!usaPostgres()) return;
  const schema = schemaPrisma();
  const aceptarPerdida = opciones.acceptDataLoss === true ? " --accept-data-loss" : "";
  execSync(`npx prisma db push --schema=${schema}${aceptarPerdida}`, { stdio: "inherit" });
}