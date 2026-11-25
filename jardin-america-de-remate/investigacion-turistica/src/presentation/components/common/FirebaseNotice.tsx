import { Alert, Box } from '@mui/material';
import { useSurvey } from '@/application/contexts/SurveyContext';

export const FirebaseNotice = () => {
  const { firebaseReady } = useSurvey();

  if (firebaseReady) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="info" variant="outlined">
        Firebase no está configurado. Las respuestas se guardan localmente. Configurá el archivo
        `.env` para activar el guardado en la nube.
      </Alert>
    </Box>
  );
};
