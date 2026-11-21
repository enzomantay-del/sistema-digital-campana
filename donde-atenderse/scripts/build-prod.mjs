import { execSync } from "node:child_process";
import { schemaPrisma, usaPostgres } from "./prisma-runtime.mjs";

const schema = schemaPrisma();
execSync(`npx prisma generate --schema=${schema}`, { stdio: "inherit" });
if (usaPostgres()) {
  execSync(`npx prisma db push --schema=${schema}`, { stdio: "inherit" });
}
execSync("NEXT_BUILD_DIR=prod next build", { stdio: "inherit", env: { ...process.env, NEXT_BUILD_DIR: "prod" } });