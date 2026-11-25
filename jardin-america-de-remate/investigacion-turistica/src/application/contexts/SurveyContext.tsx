import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { SurveyAnswers } from '@/domain/entities/Survey';
import { useSurveyDefinition } from '@/application/contexts/SurveyDefinitionContext';
import { getDefaultAnswers } from '@/data/surveys/helpers';
import { saveSurveyResponse, updateSurveyResponse } from '@/domain/useCases/surveyUseCases';
import { getSurveyRepository } from '@/infrastructure/firebase/firestoreSurveyRepository';
import { isFirebaseConfigured } from '@/infrastructure/firebase/config';

const generateSessionId = (): string =>
  `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface SurveyContextValue {
  answers: SurveyAnswers;
  currentSection: number;
  responseId: string | null;
  startTime: number;
  isSaving: boolean;
  firebaseReady: boolean;
  setCurrentSection: (section: number) => void;
  updateAnswers: (partial: Partial<SurveyAnswers>) => void;
  persistAnswers: (
    partial?: Partial<SurveyAnswers>,
    completed?: boolean,
  ) => Promise<{ success: boolean }>;
  saveError: string | null;
  resetSurvey: () => void;
  getElapsedSeconds: () => number;
}

const SurveyContext = createContext<SurveyContextValue | undefined>(undefined);

const loadStoredAnswers = (answersKey: string, definitionAnswers: SurveyAnswers): SurveyAnswers => {
  try {
    const stored = localStorage.getItem(answersKey);
    if (stored) return { ...definitionAnswers, ...JSON.parse(stored) };
  } catch {
    // ignore parse errors
  }
  return definitionAnswers;
};

const mergeAnswers = (base: SurveyAnswers, partial: Partial<SurveyAnswers>): SurveyAnswers => {
  const merged = { ...base };
  Object.entries(partial).forEach(([key, value]) => {
    if (value !== undefined) {
      merged[key] = value;
    }
  });
  return merged;
};

export const SurveyProvider = ({ children }: { children: ReactNode }) => {
  const definition = useSurveyDefinition();
  const repository = useMemo(
    () => getSurveyRepository(definition.collection),
    [definition.collection],
  );

  const sessionKey = `${definition.storagePrefix}_session_id`;
  const responseKey = `${definition.storagePrefix}_response_id`;
  const answersKey = `${definition.storagePrefix}_answers`;
  const startTimeKey = `${definition.storagePrefix}_start_time`;
  const defaultAnswers = useMemo(() => getDefaultAnswers(definition), [definition]);

  const [answers, setAnswers] = useState<SurveyAnswers>(() =>
    loadStoredAnswers(answersKey, defaultAnswers),
  );
  const [currentSection, setCurrentSection] = useState(0);
  const [responseId, setResponseId] = useState<string | null>(
    () => localStorage.getItem(responseKey) || null,
  );
  const [startTime] = useState<number>(() => {
    const stored = localStorage.getItem(startTimeKey);
    return stored ? Number(stored) : Date.now();
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const sessionIdRef = useRef(localStorage.getItem(sessionKey) || generateSessionId());

  const firebaseReady = isFirebaseConfigured();

  useEffect(() => {
    localStorage.setItem(sessionKey, sessionIdRef.current);
    localStorage.setItem(startTimeKey, String(startTime));
  }, [sessionKey, startTime, startTimeKey]);

  useEffect(() => {
    localStorage.setItem(answersKey, JSON.stringify(answers));
  }, [answers, answersKey]);

  const getElapsedSeconds = useCallback(
    () => Math.round((Date.now() - startTime) / 1000),
    [startTime],
  );

  const persistAnswers = useCallback(
    async (partial?: Partial<SurveyAnswers>, completed = false) => {
      const mergedAnswers = partial ? mergeAnswers(answers, partial) : answers;
      if (partial) {
        setAnswers(mergedAnswers);
      }

      if (!firebaseReady) {
        return { success: true };
      }

      setIsSaving(true);
      setSaveError(null);
      try {
        const payload = {
          respuestas: mergedAnswers,
          tiempoRespuesta: Math.round((Date.now() - startTime) / 1000),
          userAgent: navigator.userAgent,
          sessionId: sessionIdRef.current,
          timestamp: new Date(),
          completed,
        };

        if (responseId) {
          await updateSurveyResponse(repository, responseId, payload);
        } else {
          const id = await saveSurveyResponse(repository, payload);
          setResponseId(id);
          localStorage.setItem(responseKey, id);
        }

        return { success: true };
      } catch (error) {
        if (responseId) {
          setResponseId(null);
          localStorage.removeItem(responseKey);
        }

        const firebaseCode =
          typeof error === 'object' && error !== null && 'code' in error
            ? String((error as { code: string }).code)
            : '';

        setSaveError(
          firebaseCode === 'permission-denied'
            ? 'Firestore bloqueó el guardado. Copiá las reglas nuevas en Firebase → Firestore → Reglas → Publicar.'
            : 'No se pudieron guardar las respuestas en la nube. Intentá de nuevo en unos segundos.',
        );
        return { success: false };
      } finally {
        setIsSaving(false);
      }
    },
    [answers, answersKey, firebaseReady, repository, responseId, responseKey, startTime],
  );

  const updateAnswers = useCallback((partial: Partial<SurveyAnswers>) => {
    setAnswers((prev) => mergeAnswers(prev, partial));
  }, []);

  const resetSurvey = useCallback(() => {
    setAnswers(getDefaultAnswers(definition));
    setCurrentSection(0);
    setResponseId(null);
    sessionIdRef.current = generateSessionId();
    localStorage.removeItem(responseKey);
    localStorage.removeItem(answersKey);
    localStorage.removeItem(startTimeKey);
    localStorage.setItem(sessionKey, sessionIdRef.current);
    localStorage.setItem(startTimeKey, String(Date.now()));
  }, [answersKey, definition, responseKey, sessionKey, startTimeKey]);

  const value = useMemo(
    () => ({
      answers,
      currentSection,
      responseId,
      startTime,
      isSaving,
      saveError,
      firebaseReady,
      setCurrentSection,
      updateAnswers,
      persistAnswers,
      resetSurvey,
      getElapsedSeconds,
    }),
    [
      answers,
      currentSection,
      responseId,
      startTime,
      isSaving,
      saveError,
      firebaseReady,
      persistAnswers,
      resetSurvey,
      getElapsedSeconds,
    ],
  );

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>;
};

export const useSurvey = (): SurveyContextValue => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey debe usarse dentro de SurveyProvider');
  }
  return context;
};
