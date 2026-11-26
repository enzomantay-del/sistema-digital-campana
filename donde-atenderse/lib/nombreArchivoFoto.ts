export function nombreArchivoFotoDescarga(nombreProfesional: string, extension: string) {
  const base =
    nombreProfesional
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "profesional";
  const ext = extension.replace(/^\./, "").toLowerCase() || "jpg";
  return `${base}.${ext}`;
}