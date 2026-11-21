/** Elige schema SQLite (local) o Postgres (hosting con DATABASE_URL postgres). */
export function usaPostgres() {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export function schemaPrisma() {
  return usaPostgres() ? "prisma/schema.postgres.prisma" : "prisma/schema.prisma";
}