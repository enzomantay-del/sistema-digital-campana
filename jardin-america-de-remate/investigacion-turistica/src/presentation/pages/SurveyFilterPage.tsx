import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/presentation/components/layout/PageContainer';
import { FirebaseNotice } from '@/presentation/components/common/FirebaseNotice';
import { useSurveyDefinition } from '@/application/contexts/SurveyDefinitionContext';
import { QuestionLabel } from '@/presentation/components/survey/QuestionLabel';
import { useSurvey } from '@/application/contexts/SurveyContext';

export const SurveyFilterPage = () => {
  const navigate = useNavigate();
  const definition = useSurveyDefinition();
  const { answers, updateAnswers, persistAnswers } = useSurvey();
  const filterId = definition.filterQuestionId;
  const [value, setValue] = useState(
    typeof answers[filterId] === 'string' ? answers[filterId] : '',
  );
  const [error, setError] = useState(false);

  const handleContinue = () => {
    if (!value) {
      setError(true);
      return;
    }

    setError(false);
    updateAnswers({ [filterId]: value });
    void persistAnswers({ [filterId]: value }, value === 'no');

    if (value === 'no') {
      navigate(definition.routes.screenout);
      return;
    }

    navigate(definition.routes.section(1));
  };

  return (
    <PageContainer maxWidth="sm">
      <FirebaseNotice />

      <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid #F3F4F6' }}>
        <FormControl error={error} fullWidth component="fieldset">
          <FormLabel
            component="legend"
            sx={{
              display: 'block',
              mb: 2,
              color: 'text.primary',
              fontWeight: 500,
              fontSize: '1.125rem',
              lineHeight: 1.5,
            }}
          >
            <QuestionLabel
              number={definition.filterQuestionNumber}
              label={definition.filterQuestion.label}
              required
              size="lg"
            />
          </FormLabel>

          <RadioGroup value={value} onChange={(_, nextValue) => setValue(nextValue)}>
            {definition.filterQuestion.options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size="small" />}
                label={option.label}
                sx={{ mb: 0.5 }}
              />
            ))}
          </RadioGroup>

          {error && <FormHelperText>Elegí una opción para continuar</FormHelperText>}
        </FormControl>

        <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Seleccioná Sí o No para continuar.
            </Alert>
          )}
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleContinue}
            sx={{ minWidth: 160 }}
          >
            Continuar
          </Button>
        </Box>
      </Paper>
    </PageContainer>
  );
};
