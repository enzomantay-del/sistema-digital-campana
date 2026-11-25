import { gunzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { restaurarRespaldoBase, type RespaldoCercalud } from "../lib/respaldoBase";
import { execSync } from "node:child_process";

async function main() {
  const ruta = process.argv[2];
  if (!ruta) {
    console.error("Uso: DATABASE_URL=postgresql://... npm run db:restaurar-respaldo -- ./cercalud-respaldo.json.gz");
    process.exit(1);
  }
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.MIGRACION_DATABASE_URL?.trim() ||
    "";
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    console.error("Definí DATABASE_URL o MIGRACION_DATABASE_URL apuntando a Neon.");
    process.exit(1);
  }
  process.env.DATABASE_URL = url;

  const absoluta = resolve(ruta);
  const buf = await readFile(absoluta);
  const json =
    absoluta.endsWith(".gz") || buf[0] === 0x1f
      ? gunzipSync(buf).toString("utf-8")
      : buf.toString("utf-8");
  const respaldo = JSON.parse(json) as RespaldoCercalud;

  console.log("Alineando tablas en Postgres…");
  execSync("node scripts/db-push-prod.mjs", { stdio: "inherit", env: process.env });

  console.log("Restaurando datos…", respaldo.counts);
  await restaurarRespaldoBase(respaldo);
  console.log("Listo.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});