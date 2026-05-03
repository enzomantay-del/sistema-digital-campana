-- CreateTable
CREATE TABLE "Contacto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "barrio" TEXT NOT NULL,
    "notas" TEXT DEFAULT '',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Envio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "filtroBarrio" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT DEFAULT ''
);

-- CreateTable
CREATE TABLE "MessageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "envioId" TEXT NOT NULL,
    "contactoId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "detalle" TEXT DEFAULT '',
    "waMessageId" TEXT,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "MessageLog_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "Envio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageLog_contactoId_fkey" FOREIGN KEY ("contactoId") REFERENCES "Contacto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Contacto_barrio_idx" ON "Contacto"("barrio");

-- CreateIndex
CREATE INDEX "Contacto_telefono_idx" ON "Contacto"("telefono");

-- CreateIndex
CREATE INDEX "MessageLog_envioId_idx" ON "MessageLog"("envioId");

-- CreateIndex
CREATE INDEX "MessageLog_contactoId_idx" ON "MessageLog"("contactoId");
