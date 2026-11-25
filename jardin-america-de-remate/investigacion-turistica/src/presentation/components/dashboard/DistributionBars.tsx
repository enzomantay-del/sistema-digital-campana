import { Box, LinearProgress, Typography } from '@mui/material';
import type { AnalyzedOption } from '@/domain/entities/SurveyAnalysis';

interface DistributionBarsProps {
  options: AnalyzedOption[];
  showCount?: boolean;
}

export const DistributionBars = ({ options, showCount = true }: DistributionBarsProps) => {
  if (!options.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sin respuestas aún
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {options.map((option) => (
        <Box key={option.label}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75, gap: 2 }}>
            <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.5 }}>
              {option.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {showCount ? `${option.count} (${option.percentage}%)` : `${option.percentage}%`}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={option.percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#F3F4F6',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: '#111111',
              },
            }}
          />
        </Box>
      ))}
    </Box>
  );
};
