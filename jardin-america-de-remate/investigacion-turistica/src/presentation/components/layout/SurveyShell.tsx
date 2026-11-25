import type { ReactNode } from 'react';
import type { SurveyDefinition } from '@/data/surveys/types';
import { SurveyDefinitionProvider } from '@/application/contexts/SurveyDefinitionContext';
import { SurveyProvider } from '@/application/contexts/SurveyContext';

interface SurveyShellProps {
  definition: SurveyDefinition;
  children: ReactNode;
}

export const SurveyShell = ({ definition, children }: SurveyShellProps) => (
  <SurveyDefinitionProvider definition={definition}>
    <SurveyProvider>{children}</SurveyProvider>
  </SurveyDefinitionProvider>
);
