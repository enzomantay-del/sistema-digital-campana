/** Elige schema SQLite (local) o Postgres (hosting con DATABASE_URL postgres). */
export function usaPostgres() {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export function schemaPrisma() {
  if (usaPostgres()) return "prisma/schema.postgres.prisma";
  // En el build del hosting, Postgres se conecta solo al iniciar; el cliente debe ser el de Postgres.
  if (process.env.NODE_ENV === "production") return "prisma/schema.postgres.prisma";
  return "prisma/schema.prisma";
}