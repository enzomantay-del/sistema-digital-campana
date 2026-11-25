import type { QuestionType } from '@/domain/entities/Survey';

export interface AnalyzedOption {
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionAnalysis {
  number: number;
  id: string;
  label: string;
  sectionTitle: string;
  type: QuestionType | 'filter';
  answeredCount: number;
  average?: number;
  options: AnalyzedOption[];
  textResponses: string[];
}

export interface SurveyAnalysisSummary {
  totalCompleted: number;
  totalScreenedOut: number;
  totalStarted: number;
  averageTimeSeconds: number;
}

export interface SectionAnalysis {
  id: string;
  title: string;
  questions: QuestionAnalysis[];
}

export interface SurveyAnalysis {
  summary: SurveyAnalysisSummary;
  filterQuestion: QuestionAnalysis;
  sections: SectionAnalysis[];
}
