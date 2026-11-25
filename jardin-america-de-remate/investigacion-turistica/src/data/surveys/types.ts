import type { SurveySection } from '@/domain/entities/Survey';

export interface SurveyFilterQuestion {
  id: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

export interface SurveyRoutes {
  landing: string;
  filter: string;
  section: (sectionNumber: number) => string;
  completed: string;
  screenout: string;
}

export interface SurveyDefinition {
  id: string;
  adminTabLabel: string;
  shortLabel: string;
  collection: string;
  storagePrefix: string;
  sharePath: string;
  shareEnvKey?: string;
  shareMessageIntro: string;
  researchTitle: string;
  researchIntroLabel: string;
  researchIntro: string;
  researchNotice: string;
  researchThanks: string;
  estimatedMinutes: number;
  filterQuestionId: string;
  filterQuestion: SurveyFilterQuestion;
  screenoutMessage: string;
  filterQuestionNumber: number;
  sections: SurveySection[];
  routes: SurveyRoutes;
}

export type SurveySectionConfig = SurveySection;
