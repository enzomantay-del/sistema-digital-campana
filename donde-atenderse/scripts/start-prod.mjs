import { execSync } from "node:child_process";
import { sincronizarBaseDatos } from "./sync-db.mjs";
import { usaPostgres } from "./prisma-runtime.mjs";

execSync("node scripts/prisma-generate.mjs", { stdio: "inherit" });
if (process.env.DATABASE_URL?.trim()) {
  const pushDesactivado = process.env.PRISMA_DB_PUSH === "0";
  const pushEnArranque =
    !pushDesactivado &&
    (process.env.PRISMA_DB_PUSH_ON_START === "1" || (usaPostgres() && process.env.CERCALUD_SYNC_ON_START !== "0"));
  if (pushEnArranque) {
    sincronizarBaseDatos();
  }
  if (
    process.env.DATABASE_URL.startsWith("postgres://") ||
    process.env.DATABASE_URL.startsWith("postgresql://")
  ) {
    execSync("npx tsx prisma/seed-produccion.ts", { stdio: "inherit" });
  }
}
execSync("next start", { stdio: "inherit" });