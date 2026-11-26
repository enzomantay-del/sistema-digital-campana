import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { mostrarDatosEjemplo, urlSitioPublico } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  metadataBase: new URL(urlSitioPublico()),
  title: "Cercalud",
  applicationName: "Cercalud",
  description:
    "Profesionales, consultorios, hospitales, sanatorios, laboratorios e imágenes y farmacia de turno en el corredor de Jardín América.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let ejemplo = false;
  if (mostrarDatosEjemplo()) {
    try {
      ejemplo =
        (await prisma.professional.count({ where: { example: true, published: true } })) > 0;
    } catch {
      ejemplo = false;
    }
  }
  return (
    <html lang="es">
      <body className={`${nunito.variable} font-sans antialiased`}>
        <Encabezado ejemplo={ejemplo} />
        <main className="mx-auto min-h-[70vh] max-w-page px-4 py-8">{children}</main>
        <Pie ejemplo={ejemplo} />
      </body>
    </html>
  );
}
