import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { SurveyDefinition } from '@/data/surveys/types';
import { StatCard } from '@/presentation/components/dashboard/StatCard';
import {
  QuestionAnalysisCard,
  SectionAnalysisBlock,
} from '@/presentation/components/dashboard/QuestionAnalysisCard';
import { SummaryCharts } from '@/presentation/components/dashboard/SummaryCharts';
import { ShareSurveyButtons } from '@/presentation/components/common/ShareSurveyButtons';
import { LoadingScreen } from '@/presentation/components/common/LoadingScreen';
import { useSurveyAnalysis } from '@/application/hooks/useSurveyAnalysis';
import { downloadCsv, exportResponsesToCsv } from '@/domain/useCases/exportResponsesToCsv';
import { formatDuration } from '@/presentation/utils/dashboardUtils';

interface SurveyDashboardPanelProps {
  definition: SurveyDefinition;
}

export const SurveyDashboardPanel = ({ definition }: SurveyDashboardPanelProps) => {
  const { analysis, completedResponses, loading, error, refresh } = useSurveyAnalysis(definition);

  const handleExport = () => {
    const csv = exportResponsesToCsv(definition, completedResponses);
    downloadCsv(csv, `${definition.collection}_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (loading) {
    return <LoadingScreen message={`Cargando ${definition.shortLabel.toLowerCase()}...`} />;
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => void refresh()}>
          Actualizar
        </Button>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
          Exportar CSV
        </Button>
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 5,
        }}
      >
        <StatCard
          label="Encuestas completadas"
          value={analysis?.summary.totalCompleted ?? 0}
          helper="Respuestas válidas para análisis"
        />
        <StatCard
          label="Excluidos por filtro"
          value={analysis?.summary.totalScreenedOut ?? 0}
          helper="Respondieron No en la pregunta 1"
        />
        <StatCard
          label="Tiempo promedio"
          value={formatDuration(analysis?.summary.averageTimeSeconds ?? 0)}
          helper="Duración media de respuesta"
        />
        <StatCard
          label="Total de registros"
          value={analysis?.summary.totalStarted ?? 0}
          helper="Incluye parciales y completas"
        />
      </Box>

      <Box sx={{ mb: 5 }}>
        <ShareSurveyButtons
          definition={definition}
          title={`Compartir: ${definition.shortLabel}`}
        />
      </Box>

      {analysis && (
        <>
          <SummaryCharts summary={analysis.summary} />

          <Box sx={{ mb: 5 }}>
            <Typography variant="h2" sx={{ fontSize: '1.35rem', mb: 2 }}>
              Pregunta filtro
            </Typography>
            <Box sx={{ maxWidth: { md: '50%' } }}>
              <QuestionAnalysisCard analysis={analysis.filterQuestion} />
            </Box>
          </Box>

          {analysis.sections.map((section) => (
            <SectionAnalysisBlock
              key={section.id}
              title={section.title}
              questions={section.questions}
            />
          ))}
        </>
      )}
    </Box>
  );
};
