import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import type { SurveyDefinition } from '@/data/surveys/types';

const SurveyDefinitionContext = createContext<SurveyDefinition | undefined>(undefined);

export const SurveyDefinitionProvider = ({
  definition,
  children,
}: {
  definition: SurveyDefinition;
  children: ReactNode;
}) => (
  <SurveyDefinitionContext.Provider value={definition}>{children}</SurveyDefinitionContext.Provider>
);

export const useSurveyDefinition = (): SurveyDefinition => {
  const context = useContext(SurveyDefinitionContext);
  if (!context) {
    throw new Error('useSurveyDefinition debe usarse dentro de SurveyDefinitionProvider');
  }
  return context;
};
