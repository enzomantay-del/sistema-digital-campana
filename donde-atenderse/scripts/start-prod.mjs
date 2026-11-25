import { execSync } from "node:child_process";
import { sincronizarBaseDatos } from "./sync-db.mjs";

execSync("node scripts/prisma-generate.mjs", { stdio: "inherit" });
if (process.env.DATABASE_URL?.trim()) {
  if (process.env.PRISMA_DB_PUSH_ON_START === "1") {
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