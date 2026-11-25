import type { SurveyAnswers } from '@/domain/entities/Survey';
import type { SurveyDefinition } from '@/data/surveys/types';

export const getSectionByIndex = (definition: SurveyDefinition, index: number) =>
  definition.sections[index];

export const getQuestionNumber = (
  definition: SurveyDefinition,
  sectionIndex: number,
  questionIndex: number,
): number => {
  let number = definition.filterQuestionNumber + 1;

  for (let index = 0; index < sectionIndex; index++) {
    number += definition.sections[index]?.questions.length ?? 0;
  }

  return number + questionIndex;
};

export const getSectionFieldIds = (definition: SurveyDefinition, sectionIndex: number): string[] =>
  definition.sections[sectionIndex]?.questions.map((question) => question.id) ?? [];

export const isSectionComplete = (
  definition: SurveyDefinition,
  sectionIndex: number,
  answers: SurveyAnswers,
): boolean => {
  const section = definition.sections[sectionIndex];
  if (!section) return false;

  return section.questions
    .filter((question) => question.required)
    .every((question) => {
      const value = answers[question.id];
      if (Array.isArray(value)) return value.length > 0;
      return typeof value === 'string' && value.trim().length > 0;
    });
};

export const getDefaultAnswers = (definition: SurveyDefinition): SurveyAnswers => {
  const answers: SurveyAnswers = {
    [definition.filterQuestionId]: '',
  };

  definition.sections.forEach((section) => {
    section.questions.forEach((question) => {
      if (question.type === 'checkbox') {
        answers[question.id] = [];
      } else {
        answers[question.id] = '';
      }
    });
  });

  return answers;
};

export const exportHeaders = (definition: SurveyDefinition): string[] => {
  const headers = [
    'timestamp',
    'tiempoRespuesta',
    'userAgent',
    'completed',
    definition.filterQuestionId,
  ];

  definition.sections.forEach((section) => {
    section.questions.forEach((question) => {
      headers.push(question.id);
    });
  });

  return headers;
};
