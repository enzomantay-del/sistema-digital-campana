import { execSync } from "node:child_process";
import { schemaPrisma, usaPostgres } from "./prisma-runtime.mjs";

/** Alinea Postgres con `schema.postgres.prisma` (lugares, farmacias, turnos, etc.). */
export function sincronizarBaseDatos() {
  if (!usaPostgres()) return;
  const schema = schemaPrisma();
  execSync(`npx prisma db push --schema=${schema} --accept-data-loss`, { stdio: "inherit" });
}