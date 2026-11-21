import { execSync } from "node:child_process";
import { schemaPrisma } from "./prisma-runtime.mjs";
import { sincronizarBaseDatos } from "./sync-db.mjs";

const schema = schemaPrisma();
const envBuild = { ...process.env, NODE_ENV: process.env.NODE_ENV || "production" };
execSync(`npx prisma generate --schema=${schema}`, { stdio: "inherit", env: envBuild });
sincronizarBaseDatos();
// Hosting (Cursor/Vercel) exige salida en `.next`; `.next-prod` es solo para `npm run preview` en local.
execSync("next build", { stdio: "inherit" });