# Cercalud

Directorio del corredor: Santo Pipó, Hipólito Yrigoyen, Jardín América, Ruiz de Montoya, Puerto Rico y Capioví. El paciente busca sin cuenta. El profesional o la secretaria cargan la ficha.

La marca Cercalud está en la interfaz para revisarla. No se publica esta versión hasta confirmar que el nombre está disponible.

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
