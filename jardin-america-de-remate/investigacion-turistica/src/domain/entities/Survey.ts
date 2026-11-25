export type QuestionType = 'radio' | 'checkbox' | 'select' | 'scale' | 'textarea';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface SurveyQuestion {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  options?: QuestionOption[];
  helperText?: string;
  maxSelections?: number;
  labelEmphasis?: string;
}

export interface SurveySection {
  id: string;
  title: string;
  subtitle: string;
  scaleLegend?: string;
  questions: SurveyQuestion[];
}

export interface SurveyAnswers {
  [questionId: string]: string | string[];
}

export interface SurveyResponse {
  id?: string;
  timestamp: Date;
  respuestas: SurveyAnswers;
  tiempoRespuesta: number;
  userAgent: string;
  sessionId: string;
  completed: boolean;
}

export interface SurveyStats {
  totalResponses: number;
  averageTimeSeconds: number;
  roleDistribution: Record<string, number>;
  agencyAgeDistribution: Record<string, number>;
  sourcesDistribution: Record<string, number>;
  quotationTimeDistribution: Record<string, number>;
  firstProposalTimeDistribution: Record<string, number>;
  unquotedInquiriesDistribution: Record<string, number>;
  perceptionTimeQualityDistribution: Record<string, number>;
  perceptionMoreTimeDistribution: Record<string, number>;
  perceptionCompareTimeDistribution: Record<string, number>;
  perceptionUncertaintyDistribution: Record<string, number>;
  perceptionBroaderViewDistribution: Record<string, number>;
  challengesDistribution: Record<string, number>;
  salesSpeedImpactDistribution: Record<string, number>;
}
