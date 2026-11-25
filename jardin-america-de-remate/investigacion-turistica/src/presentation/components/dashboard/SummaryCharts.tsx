import { Box, Paper, Typography } from '@mui/material';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { SurveyAnalysisSummary } from '@/domain/entities/SurveyAnalysis';
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from '@/presentation/components/dashboard/chartTheme';

interface SummaryChartsProps {
  summary: SurveyAnalysisSummary;
}

export const SummaryCharts = ({ summary }: SummaryChartsProps) => {
  const participationData = [
    { name: 'Completadas', value: summary.totalCompleted },
    { name: 'Excluidos (filtro)', value: summary.totalScreenedOut },
    {
      name: 'En curso / parciales',
      value: Math.max(summary.totalStarted - summary.totalCompleted - summary.totalScreenedOut, 0),
    },
  ].filter((item) => item.value > 0);

  const hasData = participationData.length > 0;

  return (
    <Paper sx={{ p: { xs: 2.5, md: 3 }, border: '1px solid #F3F4F6', mb: 5 }}>
      <Typography variant="h2" sx={{ fontSize: '1.2rem', mb: 0.5 }}>
        Resumen visual
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Distribución general de participación en la encuesta
      </Typography>

      {hasData ? (
        <Box sx={{ width: '100%', height: 300, maxWidth: 480 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={participationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={96}
                paddingAngle={2}
              >
                {participationData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(value: number, name: string) => [`${value} registro${value === 1 ? '' : 's'}`, name]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Sin datos aún
        </Typography>
      )}
    </Paper>
  );
};
