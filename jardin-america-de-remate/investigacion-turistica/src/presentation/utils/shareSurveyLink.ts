import type { SurveyDefinition } from '@/data/surveys/types';
import { ESTIMATED_MINUTES } from '@/data/surveyConfig';

const normalizeUrl = (url: string): string => url.replace(/\/$/, '');

const getPublicOrigin = (): string => {
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
  if (authDomain?.endsWith('.firebaseapp.com')) {
    const projectId = authDomain.replace('.firebaseapp.com', '');
    return `https://${projectId}.web.app`;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

export const getSurveyShareUrl = (definition: SurveyDefinition): string => {
  if (definition.shareEnvKey) {
    const fromEnv = import.meta.env[definition.shareEnvKey]?.trim();
    if (fromEnv) return normalizeUrl(fromEnv);
  }

  const origin = getPublicOrigin();
  const path = definition.sharePath || definition.routes.landing;

  if (path === '/' || !path) {
    return origin;
  }

  return normalizeUrl(`${origin}${path}`);
};

export const getSurveyShareMessage = (definition: SurveyDefinition, url?: string): string => {
  const shareUrl = url ?? getSurveyShareUrl(definition);
  return `${definition.shareMessageIntro} Demora aproximadamente ${definition.estimatedMinutes ?? ESTIMATED_MINUTES} minutos:\n\n${shareUrl}`;
};

export const getWhatsAppShareUrl = (definition: SurveyDefinition, url?: string): string =>
  `https://wa.me/?text=${encodeURIComponent(getSurveyShareMessage(definition, url))}`;

export const getEmailShareUrl = (definition: SurveyDefinition, url?: string): string => {
  const subject = encodeURIComponent(`Encuesta: ${definition.researchTitle}`);
  const body = encodeURIComponent(getSurveyShareMessage(definition, url));
  return `mailto:?subject=${subject}&body=${body}`;
};

export const copySurveyLink = async (definition: SurveyDefinition, url?: string): Promise<void> => {
  await navigator.clipboard.writeText(url ?? getSurveyShareUrl(definition));
};
