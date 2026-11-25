import type { SurveyResponse } from '@/domain/entities/Survey';
import type { ISurveyRepository } from '@/domain/repositories/ISurveyRepository';

export const saveSurveyResponse = async (
  repository: ISurveyRepository,
  response: Omit<SurveyResponse, 'id'>,
): Promise<string> => repository.saveResponse(response);

export const updateSurveyResponse = async (
  repository: ISurveyRepository,
  id: string,
  data: Partial<SurveyResponse>,
): Promise<void> => repository.updateResponse(id, data);

export const getSurveyResponses = async (repository: ISurveyRepository) =>
  repository.getAllResponses();

export const getSurveyStats = async (repository: ISurveyRepository) =>
  repository.getStats();
