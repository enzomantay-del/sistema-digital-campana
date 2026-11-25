import { Box, Chip, Divider, Paper, Typography } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import type { QuestionAnalysis } from '@/domain/entities/SurveyAnalysis';
import { DistributionBars } from '@/presentation/components/dashboard/DistributionBars';
import { QuestionChart } from '@/presentation/components/dashboard/QuestionChart';

interface QuestionAnalysisCardProps {
  analysis: QuestionAnalysis;
}

export const QuestionAnalysisCard = ({ analysis }: QuestionAnalysisCardProps) => (
  <Paper sx={{ p: { xs: 2.5, md: 3 }, border: '1px solid #F3F4F6', height: '100%' }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      Pregunta {analysis.number}
    </Typography>
    <Typography variant="h3" sx={{ fontSize: '1.05rem', fontWeight: 600, mb: 2, lineHeight: 1.5 }}>
      {analysis.label}
    </Typography>

    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
      <Chip
        size="small"
        label={`${analysis.answeredCount} respuesta${analysis.answeredCount === 1 ? '' : 's'}`}
        sx={{ bgcolor: '#F9FAFB' }}
      />
      {analysis.average !== undefined && analysis.type !== 'scale' && (
        <Chip size="small" label={`Promedio: ${analysis.average} / 5`} sx={{ bgcolor: '#F9FAFB' }} />
      )}
    </Box>

    {analysis.type === 'textarea' ? (
      analysis.textResponses.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {analysis.textResponses.map((text, index) => (
            <Box
              key={`${analysis.id}-${index}`}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#FAFAFA',
                border: '1px solid #F3F4F6',
                display: 'flex',
                gap: 1.5,
              }}
            >
              <FormatQuoteIcon sx={{ fontSize: 18, color: '#9CA3AF', mt: 0.25, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Sin respuestas aún
        </Typography>
      )
    ) : (
      <>
        <QuestionChart analysis={analysis} />
        <Divider sx={{ my: 2.5 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 600 }}>
          Detalle numérico
        </Typography>
        <DistributionBars options={analysis.options} />
      </>
    )}
  </Paper>
);

interface SectionAnalysisBlockProps {
  title: string;
  questions: QuestionAnalysis[];
}

export const SectionAnalysisBlock = ({ title, questions }: SectionAnalysisBlockProps) => (
  <Box sx={{ mb: 5 }}>
    <Box sx={{ mb: 3 }}>
      <Typography variant="h2" sx={{ fontSize: '1.35rem', mb: 0.5 }}>
        {title}
      </Typography>
      <Divider sx={{ mt: 2 }} />
    </Box>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 3,
      }}
    >
      {questions.map((question) => (
        <Box
          key={question.id}
          sx={{
            gridColumn:
              question.type === 'textarea' || question.type === 'checkbox'
                ? { lg: '1 / -1' }
                : undefined,
          }}
        >
          <QuestionAnalysisCard analysis={question} />
        </Box>
      ))}
    </Box>
  </Box>
);
