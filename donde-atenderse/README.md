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

Cuentas de ejemplo, contraseña `ejemplo123`:

- `ana@ejemplo.com` edita la ficha de la Dra. Ana López
- `recepcion@ejemplo.com` edita el Hospital de Jardín América

Los profesionales y lugares que aparecen al entrar son datos de ejemplo.
