import { useCallback, useEffect, useState } from 'react';
import type { SurveyResponse, SurveyStats } from '@/domain/entities/Survey';
import { getSurveyResponses, getSurveyStats } from '@/domain/useCases/surveyUseCases';
import { surveyRepository } from '@/infrastructure/firebase/firestoreSurveyRepository';

export const useSurveyStats = () => {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, responsesData] = await Promise.all([
        getSurveyStats(surveyRepository),
        getSurveyResponses(surveyRepository),
      ]);
      setStats(statsData);
      setResponses(responsesData.filter((r) => r.completed));
    } catch {
      setError('No se pudieron cargar los datos. Verificá la configuración de Firebase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, responses, loading, error, refresh };
};
