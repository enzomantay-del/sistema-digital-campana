import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type CollectionReference,
  type UpdateData,
} from 'firebase/firestore';
import type { ISurveyRepository } from '@/domain/repositories/ISurveyRepository';
import type { SurveyResponse, SurveyStats } from '@/domain/entities/Survey';
import { requireDb } from '@/infrastructure/firebase/config';
import { agenciesSurvey } from '@/data/surveys/agenciesSurvey';

const mapDocToResponse = (id: string, data: Record<string, unknown>): SurveyResponse => {
  const timestampValue = data.timestamp as { toDate?: () => Date } | undefined;

  return {
    id,
    timestamp: timestampValue?.toDate?.() ?? new Date(),
    respuestas: (data.respuestas as SurveyResponse['respuestas']) ?? {},
    tiempoRespuesta: (data.tiempoRespuesta as number) ?? 0,
    userAgent: (data.userAgent as string) ?? '',
    sessionId: (data.sessionId as string) ?? '',
    completed: Boolean(data.completed),
  };
};

const buildDistribution = (
  responses: SurveyResponse[],
  field: string,
  multi = false,
): Record<string, number> => {
  const distribution: Record<string, number> = {};

  responses.forEach((response) => {
    const value = response.respuestas[field];
    if (multi && Array.isArray(value)) {
      value.forEach((item) => {
        distribution[item] = (distribution[item] ?? 0) + 1;
      });
    } else if (typeof value === 'string' && value) {
      distribution[value] = (distribution[value] ?? 0) + 1;
    }
  });

  return distribution;
};

export class FirestoreSurveyRepository implements ISurveyRepository {
  constructor(private readonly collectionName: string) {}

  private getCollectionRef = (): CollectionReference =>
    collection(requireDb(), this.collectionName);

  async saveResponse(response: Omit<SurveyResponse, 'id'>): Promise<string> {
    const docRef = await addDoc(this.getCollectionRef(), {
      timestamp: serverTimestamp(),
      respuestas: response.respuestas,
      tiempoRespuesta: response.tiempoRespuesta,
      userAgent: response.userAgent,
      sessionId: response.sessionId,
      completed: response.completed,
    });
    return docRef.id;
  }

  async updateResponse(id: string, data: Partial<SurveyResponse>): Promise<void> {
    const docRef = doc(requireDb(), this.collectionName, id);
    const payload: UpdateData<SurveyResponse> = {};

    if (data.respuestas !== undefined) payload.respuestas = data.respuestas;
    if (data.tiempoRespuesta !== undefined) payload.tiempoRespuesta = data.tiempoRespuesta;
    if (data.completed !== undefined) payload.completed = data.completed;

    await updateDoc(docRef, payload);
  }

  async getAllResponses(): Promise<SurveyResponse[]> {
    const q = query(this.getCollectionRef(), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((document) =>
      mapDocToResponse(document.id, document.data() as Record<string, unknown>),
    );
  }

  async getStats(): Promise<SurveyStats> {
    const responses = (await this.getAllResponses()).filter((response) => response.completed);
    const totalTime = responses.reduce((sum, response) => sum + response.tiempoRespuesta, 0);

    return {
      totalResponses: responses.length,
      averageTimeSeconds: responses.length ? Math.round(totalTime / responses.length) : 0,
      roleDistribution: buildDistribution(responses, 'funcionPrincipal'),
      agencyAgeDistribution: buildDistribution(responses, 'aniosFuncionamientoAgencia'),
      sourcesDistribution: buildDistribution(responses, 'fuentesConsulta', true),
      quotationTimeDistribution: buildDistribution(responses, 'tiempoPreparacionCotizacion'),
      firstProposalTimeDistribution: buildDistribution(responses, 'tiempoPrimeraPropuesta'),
      unquotedInquiriesDistribution: buildDistribution(responses, 'consultasSinCotizar'),
      perceptionTimeQualityDistribution: buildDistribution(responses, 'tiempoInfluyeCalidad'),
      perceptionMoreTimeDistribution: buildDistribution(responses, 'gustariaMasTiempo'),
      perceptionCompareTimeDistribution: buildDistribution(responses, 'compararAlternativasLento'),
      perceptionUncertaintyDistribution: buildDistribution(responses, 'incertidumbreMejorOpcion'),
      perceptionBroaderViewDistribution: buildDistribution(responses, 'visionAmpliaMejoraria'),
      challengesDistribution: buildDistribution(responses, 'desafiosCotizacion', true),
      salesSpeedImpactDistribution: buildDistribution(responses, 'ventasRespuestaRapida'),
    };
  }
}

const repositoryCache = new Map<string, FirestoreSurveyRepository>();

export const getSurveyRepository = (collectionName: string): FirestoreSurveyRepository => {
  const cached = repositoryCache.get(collectionName);
  if (cached) return cached;

  const repository = new FirestoreSurveyRepository(collectionName);
  repositoryCache.set(collectionName, repository);
  return repository;
};

export const surveyRepository = getSurveyRepository(agenciesSurvey.collection);
