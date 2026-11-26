# Por qué a veces aparece “Internal Server Error”

## Qué pasa

En **modo desarrollo** (`npm run dev`), Next.js va compilando en la carpeta **`.next`**.

Si al mismo tiempo corre un **`npm run build`** (producción) en la misma copia del proyecto, ambos procesos intentaban usar la **misma carpeta** y los archivos quedaban **mezclados o borrados**. Entonces el navegador muestra pantalla negra o **Internal Server Error** con errores del tipo `Cannot find module './611.js'`.

Eso puede pasar cuando:

- Un agente o vos corrén `build` para verificar, con el servidor de desarrollo aún abierto.
- El proceso de `dev` se corta mal y la caché queda inconsistente.

## Qué hicimos en el proyecto

- **`npm run build`** ahora compila en **`.next-prod`**, no en `.next`.
- **`npm run dev`** sigue usando solo **`.next`**.

Así build y dev no se pisan entre sí.

## Si igual ves el error

1. Cortá el servidor (Ctrl+C en la terminal donde corre `dev`).
2. Ejecutá:

```bash
npm run dev:limpio
```

## Para compartir la web por túnel (más estable que dev)

No uses `dev` horas seguidas detrás de Cloudflare si además necesitás correr builds. Mejor:

```bash
npm run preview
```

Eso hace un build de producción y levanta `next start` en el puerto 3000.