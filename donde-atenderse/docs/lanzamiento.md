# Checklist de lanzamiento — Cercalud

Orden sugerido. Vos podés avanzar hosting en paralelo; el resto es operación + variables de entorno.

## 1. Hosting y entorno

- [ ] Servidor con Node 20+ y proceso persistente (`npm run build` + `npm run start`) o plataforma compatible con Next.js 15.
- [ ] `DATABASE_URL` apuntando a una base **persistente** (recomendado: Postgres; SQLite solo en VPS con disco fijo).
- [ ] `AUTH_SECRET` con al menos 32 caracteres aleatorios.
- [ ] `ADMIN_EMAIL` y `ADMIN_PASSWORD` distintos del ejemplo.
- [ ] En producción: **no** definir `CERCALUD_MOSTRAR_EJEMPLOS=1` (oculta datos `example` y publicidades demo).
- [ ] Opcional: `CERCALUD_CONTACTO_EMAIL`, `CERCALUD_CONTACTO_WHATSAPP` para la página de contacto.

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
- [ ] Fotos: hoy se guardan en el servidor; en hosting sin disco, planear storage externo (S3, etc.).

## 3. Farmacia de turno

- [ ] Cada farmacia como lugar `kind: farmacia`, publicada.
- [ ] Turno vigente en el panel del lugar (fechas inicio/fin y fuente).

## 4. Quitar modo demo

- [ ] Sin `CERCALUD_MOSTRAR_EJEMPLOS=1` en producción.
- [ ] Si algún dato `example` quedó en la base, despublicarlo o borrarlo desde admin.
- [ ] Columna lateral: placeholder comercial (mail de contacto) en lugar de avisos de muestra.

## 5. Confianza

- [ ] Revisar textos en `/privacidad`, `/terminos`, `/contacto`.
- [ ] Dominio y HTTPS.
- [ ] Copia de seguridad periódica de la base.

## 6. Después del lanzamiento

- [ ] Analítica (opcional).
- [ ] Correo cuando una ficha queda pendiente de revisión (hoy no está implementado).
- [ ] Recuperación de contraseña (hoy no está implementado).

## Desarrollo local con ejemplos

```bash
npm run db:seed    # admin + corredor de prueba
npm run dev
```

Forzá ejemplos en un build de prueba: `CERCALUD_MOSTRAR_EJEMPLOS=1`.