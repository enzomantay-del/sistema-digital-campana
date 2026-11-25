# Plataforma de Investigación Turística

Aplicación web profesional para encuestas de investigación turística, construida con React, Vite, TypeScript, Material UI y Firebase.

## Requisitos

- Node.js 18+
- Cuenta de Firebase

## Instalación

```bash
cd investigacion-turistica
npm install
cp .env.example .env
```

Completá `.env` con las credenciales de tu proyecto Firebase (Configuración del proyecto → SDK).

## Desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`.

## Estructura (Clean Architecture)

```
src/
├── domain/          # Entidades, repositorios y casos de uso
├── infrastructure/  # Firebase (Auth + Firestore)
├── application/     # Context API y hooks personalizados
├── presentation/    # UI: páginas, componentes, tema
└── data/            # Configuración de la encuesta (fácil de extender)
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/encuesta/seccion/1-4` | Secciones de la encuesta |
| `/encuesta/completada` | Confirmación |
| `/admin/login` | Login administrador |
| `/admin` | Dashboard con estadísticas |

## Firebase

### Firestore

Colección: `investigacion_2026`

Campos por respuesta:
- `timestamp`
- `respuestas`
- `tiempoRespuesta`
- `userAgent`
- `sessionId`
- `completed`

No se almacena nombre, email ni IP.

### Authentication

Creá un usuario administrador en Firebase Console:

1. [Authentication → Usuarios](https://console.firebase.google.com/project/investigacion-turismo/authentication/users)
2. Activá **Correo electrónico/Contraseña** en Método de acceso (si no está activo)
3. **Agregar usuario** con email y contraseña
4. Ingresá en **https://investigacion-turismo.web.app/admin/login**

Si el login falla, revisá que el dominio `investigacion-turismo.web.app` esté en Authentication → Configuración → **Dominios autorizados**.

### Despliegue (publicar en internet)

El mensaje **Site Not Found** en `investigacion-turismo.web.app` significa que **todavía no se subió la encuesta** a Firebase Hosting.

#### Pasos

1. Instalá dependencias: `npm install`
2. Activá **Hosting** en [Firebase Console](https://console.firebase.google.com) → proyecto `investigacion-turismo` → **Hosting** → **Comenzar** (si aún no lo hiciste)
3. Iniciá sesión en Firebase con la **misma cuenta Google que creó el proyecto**:
   ```bash
   npx firebase login
   ```
   Si ya estabas logueado con otra cuenta: `npx firebase logout` y volvé a iniciar sesión.
4. Publicá la web:
   ```bash
   npm run deploy
   ```

   Si falla con error de **certificado SSL**, en Windows probá:
   ```cmd
   set NODE_OPTIONS=--use-system-ca
   npm run deploy
   ```

La encuesta quedará disponible en:
**https://investigacion-turismo.web.app**

#### Si falla con "permission" o "403"

La cuenta de Google del paso 3 **no tiene acceso** al proyecto Firebase. Solución:

- Entrá a Firebase Console con la cuenta dueña del proyecto
- **Configuración del proyecto** → **Usuarios y permisos** → **Agregar miembro**
- Sumá tu email con rol **Editor** o **Propietario**
- Volvé a ejecutar `npm run deploy`

También podés compartir el enlace desde el panel admin (WhatsApp, email o copiar).

Opcional: en `.env` podés fijar la URL pública:
`VITE_PUBLIC_SURVEY_URL=https://investigacion-turismo.web.app`

### Despliegue manual

```bash
npm run build
firebase deploy --only hosting
```

## Funcionalidades

- Landing con garantía de anonimato y tiempo estimado
- Encuesta en 4 secciones con barra de progreso
- Validación de campos obligatorios
- Autoguardado en Firestore
- Dashboard con gráficos y exportación CSV
- Diseño minimalista inspirado en Stripe/Notion/Linear
