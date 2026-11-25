-- Ejecutar UNA VEZ en Supabase SQL Editor.
-- Reemplaza el email por el del usuario creado en Authentication > Add user.
-- Asi el JWT incluye app_metadata.role = admin y RLS permite moderar ofertas/eventos.

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
where lower(email) = lower('CAMBIAR@EMAIL.COM');
