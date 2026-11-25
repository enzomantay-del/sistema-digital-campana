# Checklist de publicacion - Jardin Sale Week

## Antes de publicar
- Configurar `js/supabase-config.js` con URL y anon key reales.
- Ejecutar `supabase-schema.sql` en el proyecto Supabase.
- Definir al menos un usuario admin (`app_metadata.role = admin`).
- Verificar que las imagenes en `media/` cargan correctamente.
- Probar visual en desktop y mobile (navbar, hero, inscripcion y footer).

## Pruebas funcionales
- En `portal.html`, usuario nuevo puede registrarse e iniciar sesion.
- Prestador carga oferta y queda en estado `pendiente`.
- En `admin.html`, admin puede aprobar/rechazar.
- En `admin.html`, admin puede crear/publicar eventos.
- En `ofertas.html`, solo aparecen ofertas `aprobada`.
- En `ofertas.html`, solo aparecen eventos `publicado`.
- Validar accesos: `index.html` -> `comerciantes.html` y `ofertas.html`.

## SEO / Basico
- Confirmar titulo y descripcion en `index.html`, `comerciantes.html` y `ofertas.html`.
- Revisar ortografia final de textos visibles.

## Publicacion rapida (estatico)
- Opcion 1: GitHub Pages (repo + branch `main`).
- Opcion 2: Netlify Drop (arrastrar carpeta del proyecto).

## Links para compartir
- Link principal (landing): `https://TU-DOMINIO/` o `https://TU-DOMINIO/inicio`
- Comerciantes: `https://TU-DOMINIO/comerciantes`
- Sitio publico: `https://TU-DOMINIO/ofertas`
- Portal de prestadores: `https://TU-DOMINIO/portal`
- Panel admin (privado): `https://TU-DOMINIO/admin`
- Si usas GitHub Pages sin reglas de rewrite, compartir con `.html`:
  - `.../index.html`
  - `.../comerciantes.html`
  - `.../ofertas.html`
  - `.../portal.html`
  - `.../admin.html`

## Pasos recomendados para dejarlo online hoy
1. Crear cuenta en Netlify (gratis).
2. Entrar a Netlify Drop y arrastrar la carpeta `jardin-america-de-remate`.
3. Esperar deploy (1-2 minutos).
4. Probar rutas:
   - `/comerciantes`
   - `/ofertas`
   - `/portal`
   - `/admin`
5. Renombrar el subdominio en Netlify (Site settings -> Change site name).
6. Compartir enlaces finales.

## Verificacion final post-publicacion
- Abrir URL publica en celular.
- Hacer hard refresh para evitar cache viejo.
- Probar nuevamente formulario y menu.
- Validar que `admin` quede solo para uso interno (no difundir ese link).
