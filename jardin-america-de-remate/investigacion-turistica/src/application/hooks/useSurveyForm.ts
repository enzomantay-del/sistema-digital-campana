import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { SurveyAnswers } from '@/domain/entities/Survey';
import { useSurveyDefinition } from '@/application/contexts/SurveyDefinitionContext';
import { getSectionFieldIds } from '@/data/surveys/helpers';
import { useSurvey } from '@/application/contexts/SurveyContext';
import { useAutoSave } from '@/application/hooks/useAutoSave';

const getSectionDefaults = (
  definition: ReturnType<typeof useSurveyDefinition>,
  sectionIndex: number,
  answers: SurveyAnswers,
): SurveyAnswers => {
  const section = definition.sections[sectionIndex];
  if (!section) return {};

  return section.questions.reduce<SurveyAnswers>((acc, question) => {
    const stored = answers[question.id];
    if (stored !== undefined && stored !== '') {
      acc[question.id] = stored;
    } else if (question.type === 'checkbox') {
      acc[question.id] = Array.isArray(stored) ? stored : [];
    } else {
      acc[question.id] = typeof stored === 'string' ? stored : '';
    }
    return acc;
  }, {});
};

export const useSurveyForm = (sectionIndex: number) => {
  const definition = useSurveyDefinition();
  const { answers, updateAnswers } = useSurvey();
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const fieldIds = useMemo(
    () => getSectionFieldIds(definition, sectionIndex),
    [definition, sectionIndex],
  );

  const form = useForm<SurveyAnswers>({
    mode: 'onTouched',
  });

  const watchedValues = form.watch();

  useAutoSave(watchedValues);

  useEffect(() => {
    form.reset(getSectionDefaults(definition, sectionIndex, answersRef.current));
  }, [definition, fieldIds, form, sectionIndex]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      updateAnswers(values as Partial<SurveyAnswers>);
    });
    return () => subscription.unsubscribe();
  }, [form, updateAnswers]);

  const validateSection = useCallback(async () => {
    const questions = definition.sections[sectionIndex]?.questions ?? [];
    const requiredIds = questions.filter((question) => question.required).map((question) => question.id);
    return form.trigger(requiredIds, { shouldFocus: true });
  }, [definition.sections, form, sectionIndex]);

  return { form, validateSection, fieldIds };
};
