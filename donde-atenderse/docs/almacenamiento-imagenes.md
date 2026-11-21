# Fotos en el sitio publicado

**No hace falta configurar nada extra.** En la web en línea (Cursor + Postgres), las fotos de profesionales y los logos de lugares se guardan en la **misma base de datos** que el resto de Cercalud. No se pierden al republicar.

En la computadora de desarrollo, las fotos siguen en la carpeta `public/uploads/`.

## Opcional (solo si el sitio crece mucho)

Si más adelante querés un almacenamiento aparte (Cloudflare R2 / Amazon S3), podés cargar los Secrets `CERCALUD_S3_*`. Mientras no estén, se usa la base de datos automáticamente.