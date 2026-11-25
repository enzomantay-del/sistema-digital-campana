import type { SurveyResponse, SurveyStats } from '@/domain/entities/Survey';

export interface ISurveyRepository {
  saveResponse(response: Omit<SurveyResponse, 'id'>): Promise<string>;
  updateResponse(id: string, data: Partial<SurveyResponse>): Promise<void>;
  getAllResponses(): Promise<SurveyResponse[]>;
  getStats(): Promise<SurveyStats>;
}
