import { Box, Button, Paper, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '@/presentation/components/layout/PageContainer';
import { useSurveyDefinition } from '@/application/contexts/SurveyDefinitionContext';
import { useSurvey } from '@/application/contexts/SurveyContext';

export const SurveyCompletePage = () => {
  const navigate = useNavigate();
  const definition = useSurveyDefinition();
  const { getElapsedSeconds, resetSurvey } = useSurvey();
  const elapsed = getElapsedSeconds();
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const handleFinish = () => {
    resetSurvey();
    navigate(definition.routes.landing);
  };

  return (
    <PageContainer maxWidth="sm">
      <Paper
        component={motion.div}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', border: '1px solid #F3F4F6' }}
      >
        <Box
          component={motion.div}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#111', mb: 2 }} />
        </Box>

        <Typography variant="h2" gutterBottom>
          ¡Gracias por participar!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Tus respuestas fueron registradas de forma anónima.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Tiempo total: {minutes > 0 ? `${minutes} min ` : ''}{seconds} seg
        </Typography>

        <Button variant="contained" onClick={handleFinish}>
          Volver al inicio
        </Button>
      </Paper>
    </PageContainer>
  );
};
