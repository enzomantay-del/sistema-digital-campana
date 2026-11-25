import { Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '@/presentation/components/layout/PageContainer';
import { useSurveyDefinition } from '@/application/contexts/SurveyDefinitionContext';
import { useSurvey } from '@/application/contexts/SurveyContext';

export const SurveyScreenoutPage = () => {
  const navigate = useNavigate();
  const definition = useSurveyDefinition();
  const { resetSurvey } = useSurvey();

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
        sx={{ p: { xs: 4, md: 6 }, border: '1px solid #F3F4F6' }}
      >
        <Typography variant="h2" gutterBottom>
          Muchas gracias por tu tiempo
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          {definition.screenoutMessage}
        </Typography>

        <Button variant="contained" onClick={handleFinish} sx={{ mt: 4 }}>
          Volver al inicio
        </Button>
      </Paper>
    </PageContainer>
  );
};
