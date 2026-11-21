export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { bootstrapAdminDesdeSecrets } = await import("./lib/adminBootstrap");
    await bootstrapAdminDesdeSecrets();
  } catch (error) {
    console.error("instrumentation bootstrapAdmin:", error);
  }
}