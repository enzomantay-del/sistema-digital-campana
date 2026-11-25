import { useEffect, useState } from 'react';
import { Alert, Box, Paper, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, type FieldErrors } from 'react-hook-form';
import type { SurveyAnswers } from '@/domain/entities/Survey';
import { PageContainer } from '@/presentation/components/layout/PageContainer';
import { ProgressBar } from '@/presentation/components/survey/ProgressBar';
import { QuestionField } from '@/presentation/components/survey/QuestionField';
import { SectionNavigation } from '@/presentation/components/survey/SectionNavigation';
import { useSurveyDefinition } from '@/application/contexts/SurveyDefinitionContext';
import { getQuestionNumber } from '@/data/surveys/helpers';
import { useSurveyForm } from '@/application/hooks/useSurveyForm';
import { useSurvey } from '@/application/contexts/SurveyContext';
import { FirebaseNotice } from '@/presentation/components/common/FirebaseNotice';

export const SurveySectionPage = () => {
  const { sectionNumber } = useParams<{ sectionNumber: string }>();
  const navigate = useNavigate();
  const definition = useSurveyDefinition();
  const { updateAnswers, persistAnswers, saveError } = useSurvey();
  const [validationError, setValidationError] = useState(false);

  const parsedSection = Number(sectionNumber);
  const sectionIndex = Number.isFinite(parsedSection) ? parsedSection - 1 : -1;
  const section = definition.sections[sectionIndex];
  const totalSections = definition.sections.length;

  const { form } = useSurveyForm(sectionIndex);
  const { errors } = form.formState;

  useEffect(() => {
    if (!section || sectionIndex < 0 || sectionIndex >= totalSections) {
      navigate(definition.routes.landing);
    }
  }, [definition.routes.landing, navigate, section, sectionIndex, totalSections]);

  if (!section) {
    return null;
  }

  const goToNextSection = (sectionData: SurveyAnswers) => {
    updateAnswers(sectionData);
    const isLast = sectionIndex === totalSections - 1;
    void persistAnswers(sectionData, isLast);

    if (isLast) {
      navigate(definition.routes.completed);
    } else {
      navigate(definition.routes.section(sectionIndex + 2));
    }
  };

  const handleValidSubmit = (sectionData: SurveyAnswers) => {
    setValidationError(false);
    goToNextSection(sectionData);
  };

  const handleInvalidSubmit = (fieldErrors: FieldErrors<SurveyAnswers>) => {
    setValidationError(true);
    const firstInvalid = section.questions.find((question) => fieldErrors[question.id]);
    firstInvalid &&
      document
        .getElementById(`question-${firstInvalid.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleBack = () => {
    updateAnswers(form.getValues());
    if (sectionIndex > 0) {
      navigate(definition.routes.section(sectionIndex));
    }
  };

  return (
    <PageContainer maxWidth="sm">
      <FirebaseNotice />

      {validationError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Completá todos los campos obligatorios antes de continuar.
        </Alert>
      )}

      {saveError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {saveError} Podés seguir con la encuesta igualmente.
        </Alert>
      )}

      <ProgressBar current={sectionIndex} total={totalSections} />

      <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid #F3F4F6' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          {section.title}
        </Typography>
        {section.subtitle ? (
          <Typography variant="body1" color="text.secondary" sx={{ mb: section.scaleLegend ? 1 : 4 }}>
            {section.subtitle}
          </Typography>
        ) : (
          <Box sx={{ mb: section.scaleLegend ? 1 : 4 }} />
        )}
        {section.scaleLegend && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {section.scaleLegend}
          </Typography>
        )}

        <FormProvider {...form}>
          <Box
            component="form"
            noValidate
            onSubmit={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)}
          >
            {section.questions.map((question, questionIndex) => (
              <Box key={question.id} id={`question-${question.id}`}>
                <QuestionField
                  question={question}
                  number={getQuestionNumber(definition, sectionIndex, questionIndex)}
                  control={form.control}
                  errors={errors}
                />
              </Box>
            ))}

            <SectionNavigation
              onBack={handleBack}
              isFirst={sectionIndex === 0}
              isLast={sectionIndex === totalSections - 1}
            />
          </Box>
        </FormProvider>
      </Paper>
    </PageContainer>
  );
};
