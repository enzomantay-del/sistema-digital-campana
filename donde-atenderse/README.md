# Dónde atenderse

Directorio del corredor: Santo Pipó, Hipólito Yrigoyen, Jardín América, Ruiz de Montoya, Puerto Rico y Capioví. El paciente busca sin cuenta. El profesional o la secretaria cargan la ficha.

El nombre público del proyecto queda pendiente de la consulta de marca. Esta web no usa Cercalud.

## Cómo verla

```bash
cd donde-atenderse
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Abrí http://localhost:3000

Para crear una cuenta, definí `AUTH_SECRET` en el entorno con una frase larga. No la subas al repositorio.

Los profesionales y lugares que aparecen al entrar son datos de ejemplo. No tienen usuario ni contraseña.
