export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { execSync } = await import("node:child_process");
    const { schemaPrisma, usaPostgres } = await import("./scripts/prisma-runtime.mjs");
    if (usaPostgres()) {
      execSync(`npx prisma db push --schema=${schemaPrisma()} --accept-data-loss`, { stdio: "inherit" });
    }
  } catch (error) {
    console.error("instrumentation db push:", error);
  }
  try {
    const { bootstrapAdminDesdeSecrets } = await import("./lib/adminBootstrap");
    await bootstrapAdminDesdeSecrets();
  } catch (error) {
    console.error("instrumentation bootstrapAdmin:", error);
  }
}