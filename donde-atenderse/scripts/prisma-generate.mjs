import { execSync } from "node:child_process";
import { schemaPrisma } from "./prisma-runtime.mjs";

const schema = schemaPrisma();
execSync(`npx prisma generate --schema=${schema}`, { stdio: "inherit" });