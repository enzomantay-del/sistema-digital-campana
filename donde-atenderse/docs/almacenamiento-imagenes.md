# Fotos y logos en producción

En el hosting de Cursor el disco local **no es permanente**. Si no configurás almacenamiento en la nube, las imágenes pueden borrarse al republicar.

## Opción recomendada: S3 o Cloudflare R2

En **Secrets** de la app publicada, cargá:

| Variable | Ejemplo |
|----------|---------|
| `CERCALUD_S3_BUCKET` | `cercalud-imagenes` |
| `CERCALUD_S3_ACCESS_KEY_ID` | clave del proveedor |
| `CERCALUD_S3_SECRET_ACCESS_KEY` | secreto del proveedor |
| `CERCALUD_S3_REGION` | `auto` (R2) o `sa-east-1` (AWS) |
| `CERCALUD_S3_ENDPOINT` | `https://<account>.r2.cloudflarestorage.com` (R2) u omitir en AWS |
| `CERCALUD_S3_PUBLIC_BASE_URL` | URL pública del bucket o dominio custom (sin `/` final) |

El bucket debe permitir **lectura pública** de `logos/*` y `profesionales/*` (o todo el bucket si es dedicado).

### Cloudflare R2 (resumen)

1. Crear bucket y habilitar acceso público vía dominio `r2.dev` o custom domain.
2. Token de API con permiso de lectura/escritura en ese bucket.
3. `CERCALUD_S3_PUBLIC_BASE_URL` = la URL base donde se ve un objeto (ej. `https://pub-xxxx.r2.dev`).

En desarrollo local, sin estas variables, las fotos siguen en `public/uploads/` como siempre.