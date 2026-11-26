import { execSync } from "node:child_process";
import { schemaPrisma, usaPostgres } from "./prisma-runtime.mjs";
import { sincronizarBaseDatos } from "./sync-db.mjs";

const schema = schemaPrisma();
const envBuild = { ...process.env, NODE_ENV: process.env.NODE_ENV || "production" };
execSync(`npx prisma generate --schema=${schema}`, { stdio: "inherit", env: envBuild });
const pushDesactivado = process.env.PRISMA_DB_PUSH === "0";
const pushForzado = process.env.PRISMA_DB_PUSH === "1";
const urlBase = process.env.DATABASE_URL?.trim();
if (!pushDesactivado && usaPostgres() && urlBase) {
  sincronizarBaseDatos(pushForzado ? { acceptDataLoss: true } : undefined);
}
// Hosting (Cursor/Vercel/Netlify) exige salida en `.next`; `.next-prod` es solo para `npm run preview` en local.
execSync("next build", { stdio: "inherit" });