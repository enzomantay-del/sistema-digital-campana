import { useEffect, useRef } from 'react';
import { useSurvey } from '@/application/contexts/SurveyContext';
import type { SurveyAnswers } from '@/domain/entities/Survey';

export const useAutoSave = (watchedAnswers: SurveyAnswers, enabled = true) => {
  const { persistAnswers } = useSurvey();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      void persistAnswers(watchedAnswers);
    }, 1200);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watchedAnswers, enabled, persistAnswers]);
};
