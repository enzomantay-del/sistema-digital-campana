import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '@/presentation/components/layout/PageContainer';
import { ShareSurveyButtons } from '@/presentation/components/common/ShareSurveyButtons';
import { useSurveyDefinition } from '@/application/contexts/SurveyDefinitionContext';

export const SurveyLandingPage = () => {
  const navigate = useNavigate();
  const definition = useSurveyDefinition();

  return (
    <PageContainer maxWidth="sm">
      <Stack spacing={4} alignItems="flex-start">
        <Chip
          label="Investigación 2026"
          size="small"
          sx={{
            bgcolor: '#F3F4F6',
            color: 'text.secondary',
            fontWeight: 500,
            border: 'none',
          }}
        />

        <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            {definition.researchTitle}
          </Typography>
          <Typography variant="h3" component="h2" sx={{ mt: 3, mb: 1 }}>
            {definition.researchIntroLabel}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
            {definition.researchIntro}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 520 }}>
            {definition.researchNotice}
          </Typography>
          <Typography variant="body1" sx={{ mt: 3, maxWidth: 520, fontWeight: 500 }}>
            {definition.researchThanks}
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2.5,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              border: '1px solid #F3F4F6',
            }}
          >
            <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Privacidad garantizada
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No recopilamos nombre, email ni dirección IP.
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2.5,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              border: '1px solid #F3F4F6',
            }}
          >
            <ScheduleOutlinedIcon sx={{ color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Tiempo estimado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aproximadamente {definition.estimatedMinutes} minutos · {definition.sections.length}{' '}
                secciones
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(definition.routes.filter)}
          sx={{ mt: 2, px: 4, py: 1.5 }}
        >
          Comenzar
        </Button>

        <Box sx={{ width: '100%', mt: 1 }}>
          <ShareSurveyButtons definition={definition} compact />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          ¿Sos administrador?{' '}
          <Box
            component="button"
            type="button"
            onClick={() => navigate('/admin/login')}
            sx={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'text.primary',
              textDecoration: 'underline',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            Acceder al panel
          </Box>
        </Typography>
      </Stack>
    </PageContainer>
  );
};
