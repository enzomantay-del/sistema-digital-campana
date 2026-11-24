const MIME_A_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const FOTO_MAX_BYTES = 2 * 1024 * 1024;

export function tipoYExtensionFoto(archivo: File): { tipoMime: string; extension: string } | null {
  const nombre = archivo.name.trim().toLowerCase();
  const tipo = archivo.type.trim().toLowerCase();

  if (tipo && MIME_A_EXTENSION[tipo]) {
    const extension = MIME_A_EXTENSION[tipo];
    const tipoMime = extension === "jpg" ? "image/jpeg" : tipo;
    return { tipoMime, extension };
  }

  if (nombre.endsWith(".jfif") || nombre.endsWith(".jpg") || nombre.endsWith(".jpeg") || nombre.endsWith(".jpe")) {
    return { tipoMime: "image/jpeg", extension: "jpg" };
  }
  if (nombre.endsWith(".png")) return { tipoMime: "image/png", extension: "png" };
  if (nombre.endsWith(".webp")) return { tipoMime: "image/webp", extension: "webp" };
  if (nombre.endsWith(".gif")) return { tipoMime: "image/gif", extension: "gif" };

  return null;
}