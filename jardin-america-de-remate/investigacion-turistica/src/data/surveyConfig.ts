/** Compatibilidad con imports existentes. Preferir @/data/surveys */
import type { SurveyAnswers } from '@/domain/entities/Survey';
import { agenciesSurvey } from '@/data/surveys/agenciesSurvey';
import {
  exportHeaders as exportHeadersForSurvey,
  getDefaultAnswers as getDefaultAnswersForSurvey,
  getQuestionNumber as getQuestionNumberForSurvey,
  getSectionByIndex as getSectionByIndexForSurvey,
  getSectionFieldIds as getSectionFieldIdsForSurvey,
  isSectionComplete as isSectionCompleteForSurvey,
} from '@/data/surveys/helpers';

export const SURVEY_COLLECTION = agenciesSurvey.collection;

export const RESEARCH_TITLE = agenciesSurvey.researchTitle;
export const RESEARCH_INTRO_LABEL = agenciesSurvey.researchIntroLabel;
export const RESEARCH_INTRO = agenciesSurvey.researchIntro;
export const RESEARCH_NOTICE = agenciesSurvey.researchNotice;
export const RESEARCH_THANKS = agenciesSurvey.researchThanks;
export const ESTIMATED_MINUTES = agenciesSurvey.estimatedMinutes;
export const FILTER_QUESTION_ID = agenciesSurvey.filterQuestionId;
export const FILTER_QUESTION = agenciesSurvey.filterQuestion;
export const SCREENOUT_MESSAGE = agenciesSurvey.screenoutMessage;
export const FILTER_QUESTION_NUMBER = agenciesSurvey.filterQuestionNumber;
export const surveySections = agenciesSurvey.sections;

export type SurveySectionConfig = (typeof agenciesSurvey.sections)[number];

export const getSectionByIndex = (index: number) => getSectionByIndexForSurvey(agenciesSurvey, index);
export const getQuestionNumber = (sectionIndex: number, questionIndex: number) =>
  getQuestionNumberForSurvey(agenciesSurvey, sectionIndex, questionIndex);
export const getSectionFieldIds = (sectionIndex: number) =>
  getSectionFieldIdsForSurvey(agenciesSurvey, sectionIndex);
export const isSectionComplete = (sectionIndex: number, answers: SurveyAnswers) =>
  isSectionCompleteForSurvey(agenciesSurvey, sectionIndex, answers);
export const getDefaultAnswers = () => getDefaultAnswersForSurvey(agenciesSurvey);
export const exportHeaders = () => exportHeadersForSurvey(agenciesSurvey);
