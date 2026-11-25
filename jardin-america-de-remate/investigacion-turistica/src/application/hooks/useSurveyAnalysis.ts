import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SurveyResponse } from '@/domain/entities/Survey';
import type { SurveyAnalysis } from '@/domain/entities/SurveyAnalysis';
import type { SurveyDefinition } from '@/data/surveys/types';
import { analyzeSurveyResponses } from '@/domain/useCases/analyzeSurveyResponses';
import { getSurveyResponses } from '@/domain/useCases/surveyUseCases';
import { getSurveyRepository } from '@/infrastructure/firebase/firestoreSurveyRepository';

export const useSurveyAnalysis = (definition: SurveyDefinition) => {
  const repository = useMemo(
    () => getSurveyRepository(definition.collection),
    [definition.collection],
  );
  const [analysis, setAnalysis] = useState<SurveyAnalysis | null>(null);
  const [completedResponses, setCompletedResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allResponses = await getSurveyResponses(repository);
      setAnalysis(analyzeSurveyResponses(allResponses, definition));
      setCompletedResponses(allResponses.filter((response) => response.completed));
    } catch {
      setError('No se pudieron cargar los datos. Verificá la configuración de Firebase.');
    } finally {
      setLoading(false);
    }
  }, [definition, repository]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { analysis, completedResponses, loading, error, refresh };
};
