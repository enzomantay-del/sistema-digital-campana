# Cercalud

Directorio del corredor: Santo Pipó, Hipólito Yrigoyen, Jardín América, Ruiz de Montoya, Puerto Rico y Capioví. El paciente busca sin cuenta. El profesional o la secretaria cargan la ficha.

La marca Cercalud está confirmada. El sitio usa el logo oficial, en azul y verde.

## Cómo verla

```bash
cd donde-atenderse
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Abrí http://localhost:3000

Si en el navegador ves **Internal Server Error** con `npm run dev`, cortá el servidor y arrancá de nuevo con caché limpia:

```bash
npm run dev:limpio
```

Para crear una cuenta, definí `AUTH_SECRET` en el entorno con una frase larga. No la subas al repositorio.

Los profesionales y lugares que aparecen al entrar son datos de ejemplo. No tienen usuario ni contraseña.
