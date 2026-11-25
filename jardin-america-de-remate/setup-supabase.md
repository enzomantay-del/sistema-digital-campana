# Setup rapido - Portal con aprobacion admin

## 1) Crear proyecto Supabase
- Crear proyecto en [Supabase](https://supabase.com/).
- Copiar `Project URL` y `anon public key` (Settings -> API).

## 2) Crear tablas y politicas
- Abrir SQL Editor.
- Ejecutar `supabase-schema.sql`.

## 3) Configurar frontend
- Editar `js/supabase-config.js`:
  - `window.SUPABASE_URL`
  - `window.SUPABASE_ANON_KEY`

## 4) Definir un usuario admin
- Crear usuario normalmente desde `portal.html` o panel Auth.
- En Supabase, editar ese usuario y agregar en `app_metadata`:
```json
{
  "role": "admin"
}
```

## 5) Flujo funcional
- Prestador entra a `portal.html`, crea cuenta y carga oferta.
- La oferta se guarda como `pendiente`.
- Admin entra a `admin.html`, aprueba/rechaza.
- Solo `aprobada` aparece automaticamente en `ofertas.html` (seccion Ofertas).
- Admin puede crear eventos en `admin.html` y publicarlos.
- Solo eventos `publicado` aparecen en `ofertas.html` (seccion Eventos).

## 6) Rutas del MVP
- `index.html` -> selector de accesos (comerciantes/publico).
- `comerciantes.html` -> landing para QR de comerciantes.
- `ofertas.html` -> sitio publico para QR de redes (ofertas + eventos).
- `portal.html` -> carga y gestion de ofertas del prestador.
- `admin.html` -> moderacion de ofertas + gestion de eventos.

## 7) Recomendaciones para produccion
- Activar confirmacion de email en Auth.
- Configurar dominio permitido (URL Configuration).
- Revisar politicas RLS antes de publicar.
