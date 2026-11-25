import type { SurveyDefinition } from '@/data/surveys/types';
import { agenciesSurvey } from '@/data/surveys/agenciesSurvey';
import { travelersSurvey } from '@/data/surveys/travelersSurvey';

export { agenciesSurvey, travelersSurvey };
export type { SurveyDefinition } from '@/data/surveys/types';

export const surveyDefinitions: SurveyDefinition[] = [agenciesSurvey, travelersSurvey];

export const getSurveyById = (id: string): SurveyDefinition | undefined =>
  surveyDefinitions.find((definition) => definition.id === id);

export const getSurveyByPath = (pathname: string): SurveyDefinition | undefined => {
  if (pathname.startsWith('/viajeros')) {
    return travelersSurvey;
  }

  if (
    pathname === '/' ||
    pathname.startsWith('/encuesta') ||
    pathname.startsWith('/admin')
  ) {
    return agenciesSurvey;
  }

  return undefined;
};
