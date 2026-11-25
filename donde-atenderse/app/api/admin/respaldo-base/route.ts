import { gzipSync } from "node:zlib";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { exportarRespaldoBase } from "@/lib/respaldoBase";

export const runtime = "nodejs";

export async function GET() {
  const admin = await usuarioActual();
  if (!admin || !esAdmin(admin)) {
    return new Response("Tenés que entrar como administrador.", { status: 401 });
  }

  const respaldo = await exportarRespaldoBase();
  const json = JSON.stringify(respaldo);
  const comprimido = gzipSync(Buffer.from(json, "utf-8"));
  const fecha = new Date().toISOString().slice(0, 10);

  return new Response(comprimido, {
    status: 200,
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="cercalud-respaldo-${fecha}.json.gz"`,
      "Cache-Control": "no-store",
    },
  });
}