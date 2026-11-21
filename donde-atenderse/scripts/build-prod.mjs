import { execSync } from "node:child_process";
import { schemaPrisma, usaPostgres } from "./prisma-runtime.mjs";

const schema = schemaPrisma();
const envBuild = { ...process.env, NODE_ENV: process.env.NODE_ENV || "production" };
execSync(`npx prisma generate --schema=${schema}`, { stdio: "inherit", env: envBuild });
if (usaPostgres()) {
  execSync(`npx prisma db push --schema=${schema}`, { stdio: "inherit" });
}
// Hosting (Cursor/Vercel) exige salida en `.next`; `.next-prod` es solo para `npm run preview` en local.
execSync("next build", { stdio: "inherit" });