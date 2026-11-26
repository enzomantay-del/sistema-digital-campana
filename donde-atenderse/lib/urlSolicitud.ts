import { NextResponse } from "next/server";

/** Origen público de la app (en hosting la URL interna no coincide con la del navegador). */
export function origenSolicitud(request: Request) {
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  if (host) return `${proto}://${host}`;
  return new URL(request.url).origin;
}

export function urlAbsolutaSolicitud(request: Request, path: string) {
  return new URL(path, origenSolicitud(request));
}

export function redirigirSolicitud(request: Request, path: string, status = 303) {
  return NextResponse.redirect(urlAbsolutaSolicitud(request, path), status);
}