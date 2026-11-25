// Acceso privado al panel admin (solo vos).
//
// 1) Copia este archivo a: js/admin-access.js
// 2) Elegi una clave larga para ADMIN_PANEL_SECRET (es la unica que pedira admin.html).
// 3) En Supabase: Authentication > Users > Add user (email + contrasena). Una sola vez, desde el panel.
// 4) En Supabase SQL Editor ejecuta set-admin-app-role.sql con ese email (asigna rol admin al JWT).
//
// No subas js/admin-access.js a repos publicos.

window.ADMIN_PANEL_SECRET = "cambiar-por-una-clave-larga-y-secreta";
window.ADMIN_SUPABASE_EMAIL = "admin@ejemplo.com";
window.ADMIN_SUPABASE_PASSWORD = "la-contrasena-del-usuario-creado-en-supabase";
