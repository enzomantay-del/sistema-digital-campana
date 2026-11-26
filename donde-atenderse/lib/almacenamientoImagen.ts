import { mkdir, readdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "./prisma";
import { mimeDesdeExtension } from "./validarFoto";

export type BytesImagenEntidad = { contenido: Buffer; tipoMime: string; extension: string };

export type CarpetaImagen = "logos" | "profesionales";

function bucketConfigurado() {
  return Boolean(process.env.CERCALUD_S3_BUCKET?.trim());
}

function credencialesS3() {
  const accessKeyId = process.env.CERCALUD_S3_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.CERCALUD_S3_SECRET_ACCESS_KEY?.trim() ?? "";
  return accessKeyId.length > 0 && secretAccessKey.length > 0;
}

export function almacenamientoPersistenteEnNube() {
  return bucketConfigurado() && credencialesS3();
}

/** En el hosting de Cercalud las fotos van a la base Postgres (sin configurar nada extra). */
export function almacenamientoEnBaseDatos() {
  if (almacenamientoPersistenteEnNube()) return false;
  return process.env.NODE_ENV === "production" && (process.env.DATABASE_URL?.startsWith("postgres") ?? false);
}

export function fotosPersistenEnProduccion() {
  return almacenamientoPersistenteEnNube() || almacenamientoEnBaseDatos();
}

function configS3() {
  return {
    bucket: process.env.CERCALUD_S3_BUCKET!.trim(),
    region: process.env.CERCALUD_S3_REGION?.trim() || "auto",
    endpoint: process.env.CERCALUD_S3_ENDPOINT?.trim() || undefined,
    publicBase: (process.env.CERCALUD_S3_PUBLIC_BASE_URL?.trim() || "").replace(/\/$/, ""),
  };
}

async function clienteS3() {
  const { S3Client } = await import("@aws-sdk/client-s3");
  const cfg = configS3();
  return new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint,
    credentials: {
      accessKeyId: process.env.CERCALUD_S3_ACCESS_KEY_ID!.trim(),
      secretAccessKey: process.env.CERCALUD_S3_SECRET_ACCESS_KEY!.trim(),
    },
    forcePathStyle: Boolean(cfg.endpoint),
  });
}

function claveObjeto(carpeta: CarpetaImagen, entidadId: string, extension: string) {
  return `${carpeta}/${entidadId}.${extension}`;
}

function rutaLocal(carpeta: CarpetaImagen) {
  return path.join(process.cwd(), "public", "uploads", carpeta);
}

function urlPublicaImagen(carpeta: CarpetaImagen, entidadId: string) {
  return `/api/imagen/${carpeta}/${entidadId}?v=${Date.now()}`;
}

async function quitarEnBaseDatos(carpeta: CarpetaImagen, entidadId: string) {
  await prisma.imagenAlmacenada.deleteMany({ where: { carpeta, entidadId } });
}

export async function leerImagenEntidad(
  carpeta: CarpetaImagen,
  entidadId: string,
): Promise<BytesImagenEntidad | null> {
  if (almacenamientoPersistenteEnNube()) {
    const { ListObjectsV2Command, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const cliente = await clienteS3();
    const bucket = configS3().bucket;
    const prefijo = `${carpeta}/${entidadId}.`;
    const listado = await cliente.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefijo, MaxKeys: 5 }));
    const key = listado.Contents?.find((objeto) => objeto.Key && objeto.Key.startsWith(prefijo))?.Key;
    if (!key) return null;
    const extension = key.slice(prefijo.length).toLowerCase() || "jpg";
    const objeto = await cliente.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const cuerpo = await objeto.Body?.transformToByteArray();
    if (!cuerpo) return null;
    const tipoMime = objeto.ContentType?.trim() || mimeDesdeExtension(extension);
    return { contenido: Buffer.from(cuerpo), tipoMime, extension };
  }

  if (almacenamientoEnBaseDatos()) {
    const fila = await prisma.imagenAlmacenada.findUnique({
      where: { carpeta_entidadId: { carpeta, entidadId } },
    });
    if (!fila) return null;
    const bytes = fila.datos instanceof Buffer ? fila.datos : Buffer.from(fila.datos);
    const extension =
      fila.tipoMime.includes("png") ? "png" : fila.tipoMime.includes("webp") ? "webp" : fila.tipoMime.includes("gif") ? "gif" : "jpg";
    return { contenido: bytes, tipoMime: fila.tipoMime, extension };
  }

  const dir = rutaLocal(carpeta);
  try {
    const archivos = await readdir(dir);
    const nombre = archivos.find((item) => item.startsWith(`${entidadId}.`));
    if (!nombre) return null;
    const extension = nombre.slice(entidadId.length + 1).toLowerCase() || "jpg";
    const contenido = await readFile(path.join(dir, nombre));
    return { contenido, tipoMime: mimeDesdeExtension(extension), extension };
  } catch {
    return null;
  }
}

export async function quitarImagenesEntidad(carpeta: CarpetaImagen, entidadId: string) {
  if (almacenamientoPersistenteEnNube()) {
    const { ListObjectsV2Command, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const cliente = await clienteS3();
    const bucket = configS3().bucket;
    const prefijo = `${carpeta}/${entidadId}.`;
    let token: string | undefined;
    do {
      const listado = await cliente.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: prefijo, ContinuationToken: token }),
      );
      for (const objeto of listado.Contents ?? []) {
        if (objeto.Key) {
          await cliente.send(new DeleteObjectCommand({ Bucket: bucket, Key: objeto.Key }));
        }
      }
      token = listado.IsTruncated ? listado.NextContinuationToken : undefined;
    } while (token);
    return;
  }

  if (almacenamientoEnBaseDatos()) {
    await quitarEnBaseDatos(carpeta, entidadId);
    return;
  }

  const dir = rutaLocal(carpeta);
  try {
    const archivos = await readdir(dir);
    for (const nombre of archivos) {
      if (nombre.startsWith(`${entidadId}.`)) {
        await unlink(path.join(dir, nombre));
      }
    }
  } catch {
    /* sin carpeta */
  }
}

export async function guardarImagenEntidad(
  carpeta: CarpetaImagen,
  entidadId: string,
  contenido: Buffer,
  tipoMime: string,
  extension: string,
): Promise<string> {
  await quitarImagenesEntidad(carpeta, entidadId);

  if (almacenamientoPersistenteEnNube()) {
    const cfg = configS3();
    if (!cfg.publicBase) {
      throw new Error("Falta CERCALUD_S3_PUBLIC_BASE_URL para servir las imágenes.");
    }
    const key = claveObjeto(carpeta, entidadId, extension);
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const cliente = await clienteS3();
    await cliente.send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
        Body: contenido,
        ContentType: tipoMime,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return `${cfg.publicBase}/${key}?v=${Date.now()}`;
  }

  if (almacenamientoEnBaseDatos()) {
    await prisma.imagenAlmacenada.upsert({
      where: { carpeta_entidadId: { carpeta, entidadId } },
      create: { carpeta, entidadId, tipoMime, datos: contenido },
      update: { tipoMime, datos: contenido },
    });
    return urlPublicaImagen(carpeta, entidadId);
  }

  const dir = rutaLocal(carpeta);
  await mkdir(dir, { recursive: true });
  const nombre = `${entidadId}.${extension}`;
  await writeFile(path.join(dir, nombre), contenido);
  return `/uploads/${carpeta}/${nombre}?v=${Date.now()}`;
}