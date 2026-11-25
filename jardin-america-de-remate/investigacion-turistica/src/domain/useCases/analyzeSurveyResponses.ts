import type { SurveyResponse } from '@/domain/entities/Survey';
import type {
  AnalyzedOption,
  QuestionAnalysis,
  SectionAnalysis,
  SurveyAnalysis,
} from '@/domain/entities/SurveyAnalysis';
import type { SurveyQuestion } from '@/domain/entities/Survey';
import type { SurveyDefinition } from '@/data/surveys/types';
import { getQuestionNumber } from '@/data/surveys/helpers';

const scaleLabels: Record<string, string> = {
  '1': '1 · Totalmente en desacuerdo',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5 · Totalmente de acuerdo',
};

const getOptionLabel = (question: SurveyQuestion, value: string): string => {
  const fromOptions = question.options?.find((option) => option.value === value)?.label;
  return fromOptions ?? scaleLabels[value] ?? value;
};

const buildOptionAnalysis = (
  responses: SurveyResponse[],
  question: SurveyQuestion,
  multi = false,
): AnalyzedOption[] => {
  const counts: Record<string, number> = {};

  if (question.type === 'scale') {
    ['1', '2', '3', '4', '5'].forEach((value) => {
      counts[value] = 0;
    });
  } else {
    question.options?.forEach((option) => {
      counts[option.value] = 0;
    });
  }

  let answeredCount = 0;

  responses.forEach((response) => {
    const value = response.respuestas[question.id];

    if (multi && Array.isArray(value)) {
      if (value.length > 0) answeredCount += 1;
      value.forEach((item) => {
        counts[item] = (counts[item] ?? 0) + 1;
      });
      return;
    }

    if (typeof value === 'string' && value.trim()) {
      answeredCount += 1;
      counts[value] = (counts[value] ?? 0) + 1;
    }
  });

  const denominator = answeredCount || 1;

  return Object.entries(counts).map(([value, count]) => ({
    label: getOptionLabel(question, value),
    count,
    percentage: Math.round((count / denominator) * 100),
  }));
};

const buildScaleAverage = (responses: SurveyResponse[], questionId: string): number | undefined => {
  const values = responses
    .map((response) => response.respuestas[questionId])
    .filter((value): value is string => typeof value === 'string' && Boolean(value))
    .map(Number)
    .filter((value) => !Number.isNaN(value));

  if (!values.length) return undefined;

  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 10) / 10;
};

const buildTextResponses = (responses: SurveyResponse[], questionId: string): string[] =>
  responses
    .map((response) => response.respuestas[questionId])
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim());

const analyzeQuestion = (
  definition: SurveyDefinition,
  responses: SurveyResponse[],
  question: SurveyQuestion,
  sectionTitle: string,
  sectionIndex: number,
  questionIndex: number,
): QuestionAnalysis => {
  const answeredCount =
    question.type === 'checkbox'
      ? responses.filter((response) => {
          const value = response.respuestas[question.id];
          return Array.isArray(value) && value.length > 0;
        }).length
      : responses.filter((response) => {
          const value = response.respuestas[question.id];
          return typeof value === 'string' && value.trim().length > 0;
        }).length;

  if (question.type === 'textarea') {
    return {
      number: getQuestionNumber(definition, sectionIndex, questionIndex),
      id: question.id,
      label: question.label,
      sectionTitle,
      type: question.type,
      answeredCount,
      options: [],
      textResponses: buildTextResponses(responses, question.id),
    };
  }

  const multi = question.type === 'checkbox';

  return {
    number: getQuestionNumber(definition, sectionIndex, questionIndex),
    id: question.id,
    label: question.label,
    sectionTitle,
    type: question.type,
    answeredCount,
    average: question.type === 'scale' ? buildScaleAverage(responses, question.id) : undefined,
    options: buildOptionAnalysis(responses, question, multi),
    textResponses: [],
  };
};

const analyzeFilterQuestion = (
  definition: SurveyDefinition,
  allResponses: SurveyResponse[],
): QuestionAnalysis => {
  const counts: Record<string, number> = {
    si: 0,
    no: 0,
  };

  let answeredCount = 0;

  allResponses.forEach((response) => {
    const value = response.respuestas[definition.filterQuestionId];
    if (value === 'si' || value === 'no') {
      answeredCount += 1;
      counts[value] += 1;
    }
  });

  const denominator = answeredCount || 1;

  return {
    number: definition.filterQuestionNumber,
    id: definition.filterQuestionId,
    label: definition.filterQuestion.label,
    sectionTitle: 'Filtro',
    type: 'filter',
    answeredCount,
    options: definition.filterQuestion.options.map((option) => ({
      label: option.label,
      count: counts[option.value] ?? 0,
      percentage: Math.round(((counts[option.value] ?? 0) / denominator) * 100),
    })),
    textResponses: [],
  };
};

export const analyzeSurveyResponses = (
  allResponses: SurveyResponse[],
  definition: SurveyDefinition,
): SurveyAnalysis => {
  const completedResponses = allResponses.filter((response) => response.completed);
  const screenedOut = allResponses.filter(
    (response) =>
      response.respuestas[definition.filterQuestionId] === 'no' && !response.completed,
  );
  const totalTime = completedResponses.reduce((sum, response) => sum + response.tiempoRespuesta, 0);

  const sections: SectionAnalysis[] = definition.sections.map((section, sectionIndex) => ({
    id: section.id,
    title: section.title,
    questions: section.questions.map((question, questionIndex) =>
      analyzeQuestion(
        definition,
        completedResponses,
        question,
        section.title,
        sectionIndex,
        questionIndex,
      ),
    ),
  }));

  return {
    summary: {
      totalCompleted: completedResponses.length,
      totalScreenedOut: screenedOut.length,
      totalStarted: allResponses.length,
      averageTimeSeconds: completedResponses.length
        ? Math.round(totalTime / completedResponses.length)
        : 0,
    },
    filterQuestion: analyzeFilterQuestion(definition, allResponses),
    sections,
  };
};
