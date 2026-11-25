import type { SurveyResponse } from '@/domain/entities/Survey';
import type { SurveyDefinition } from '@/data/surveys/types';
import { exportHeaders } from '@/data/surveys/helpers';

const escapeCsvValue = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const exportResponsesToCsv = (
  definition: SurveyDefinition,
  responses: SurveyResponse[],
): string => {
  const headers = exportHeaders(definition);
  const rows = responses.map((response) => {
    const row: string[] = [
      response.timestamp.toISOString(),
      String(response.tiempoRespuesta),
      response.userAgent,
      String(response.completed),
    ];

    headers.slice(4).forEach((field) => {
      const value = response.respuestas[field];
      if (Array.isArray(value)) {
        row.push(escapeCsvValue(value.join('; ')));
      } else {
        row.push(escapeCsvValue(value ?? ''));
      }
    });

    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

export const downloadCsv = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
