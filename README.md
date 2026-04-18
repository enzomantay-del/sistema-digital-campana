# Propuesta — Tienda virtual Ferretería Kozlowski

Sitio estático listo para publicar en **GitHub Pages**. La propuesta está en `docs/index.html` para poder usar la carpeta `docs` como origen del sitio.

## Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub (puede ser privado o público).
2. Subí el contenido de esta carpeta de proyecto (incluida la carpeta `docs`).
3. En el repo: **Settings → Pages**.
4. En **Build and deployment → Branch**:
   - Branch: `main` (o `master`, la que uses).
   - Folder: **`/docs`**.
5. Guardá. En uno o dos minutos tendrás una URL del tipo:

   `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`

6. Compartí esa URL: se ve bien en celular y en computadora.

### Nota

El archivo `docs/.nojekyll` evita que GitHub intente procesar el sitio con Jekyll y asegura que el HTML se sirva tal cual.

## Vista local

Abrí `docs/index.html` en el navegador o usá un servidor local desde la raíz del proyecto:

```bash
python -m http.server 8080
```

Luego: `http://localhost:8080/docs/`
