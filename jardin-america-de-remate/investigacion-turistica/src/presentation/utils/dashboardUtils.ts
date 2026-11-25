import { surveySections } from '@/data/surveyConfig';

const labelMap = new Map<string, string>();

surveySections.forEach((section) => {
  section.questions.forEach((question) => {
    if ('options' in question && question.options) {
      question.options.forEach((option) => {
        labelMap.set(option.value, option.label);
      });
    }
  });
});

const scaleLabels: Record<string, string> = {
  '1': 'Totalmente en desacuerdo',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': 'Totalmente de acuerdo',
};

export const mapDistributionLabels = (data: Record<string, number>): Record<string, number> => {
  const mapped: Record<string, number> = {};

  Object.entries(data).forEach(([key, value]) => {
    const label = labelMap.get(key) ?? scaleLabels[key] ?? key;
    mapped[label] = value;
  });

  return mapped;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds} seg`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining > 0 ? `${minutes} min ${remaining} seg` : `${minutes} min`;
};
