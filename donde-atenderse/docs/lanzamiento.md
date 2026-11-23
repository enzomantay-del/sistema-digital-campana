# Checklist de lanzamiento — Cercalud

Orden sugerido. Vos podés avanzar hosting en paralelo; el resto es operación + variables de entorno.

## 1. Hosting y entorno

### Opción A — Publicación en Cursor (recomendada si usás este flujo)

1. Confirmá la publicación de la app **cercalud** desde el botón **Publish** en el chat del agente.
2. Elegí visibilidad **pública** (o team si preferís solo equipo).
3. En Secrets, cargá: `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (y opcional `CERCALUD_CONTACTO_EMAIL`).
4. El hosting asigna **Postgres** (`cursor-app.json`); en el primer `start` se crean tablas y el admin con `seed-produccion` si la base está vacía.
5. Dominio propio: seguí [dominio-cercalud.md](./dominio-cercalud.md) (NIC → Cloudflare → pestaña **Domain** en Cursor → `CERCALUD_SITE_URL`).

### Opción B — Servidor propio

- [ ] Node 20+ y `npm run build` + `npm run start`.
- [ ] `DATABASE_URL` con Postgres en producción (SQLite solo para desarrollo local).
- [ ] `AUTH_SECRET` con al menos 32 caracteres aleatorios.
- [ ] `ADMIN_EMAIL` y `ADMIN_PASSWORD` distintos del ejemplo.
- [ ] En producción: **no** definir `CERCALUD_MOSTRAR_EJEMPLOS=1` (oculta datos `example` y publicidades demo).
- [ ] Opcional: `CERCALUD_CONTACTO_EMAIL`, `CERCALUD_CONTACTO_WHATSAPP` para la página de contacto.
- [ ] Correo público `contacto@cercalud.com.ar` sin costo: ver [correo-cercalud.md](./correo-cercalud.md) (NIC + Cloudflare Email Routing + Gmail solo de Cercalud).

Primera carga de base en producción:

```bash
npx prisma db push
npm run db:seed:produccion
```

No uses `npm run db:seed` en producción (carga el corredor de ejemplo).

## 2. Contenido real

- [ ] Lugares reales creados y **publicados** desde Administración.
- [ ] Profesionales registrados → revisión de matrícula/WhatsApp → **publicar ficha**.
- [ ] Horarios v2 cargados por lugar y por profesional.
- [x] Fotos: en el sitio publicado se guardan en la base de datos (sin configuración extra). Ver [almacenamiento-imagenes.md](./almacenamiento-imagenes.md).

## 3. Farmacia de turno

- [ ] Cada farmacia como lugar `kind: farmacia`, publicada.
- [ ] Turnos importados desde el turnero en **Administración** (no en la ficha del lugar).

## 4. Quitar modo demo

- [ ] Sin `CERCALUD_MOSTRAR_EJEMPLOS=1` en producción.
- [ ] Si algún dato `example` quedó en la base, despublicarlo o borrarlo desde admin.
- [ ] Columna lateral: placeholder comercial (mail de contacto) en lugar de avisos de muestra.
- [ ] Publicidad: ver [publicidad.md](./publicidad.md) (ejemplo rotulado; pasar a creatividad real cuando haya patrocinio).

## 5. Confianza

- [ ] Revisar textos en `/privacidad`, `/terminos`, `/contacto`.
- [ ] Dominio y HTTPS.
- [ ] Copia de seguridad periódica de la base.

## 6. Después del lanzamiento

- [ ] Analítica (opcional).
- [ ] Correo cuando una ficha queda pendiente de revisión (hoy no está implementado).
- [x] Recuperación de contraseña: página `/entrar/recuperar` (contacto manual; sin correo automático todavía).

## Desarrollo local con ejemplos

```bash
npm run db:seed    # admin + corredor de prueba
npm run dev
```

Forzá ejemplos en un build de prueba: `CERCALUD_MOSTRAR_EJEMPLOS=1`.