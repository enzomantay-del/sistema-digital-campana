import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import type { SurveyDefinition } from '@/data/surveys/types';
import {
  copySurveyLink,
  getEmailShareUrl,
  getSurveyShareUrl,
  getWhatsAppShareUrl,
} from '@/presentation/utils/shareSurveyLink';

interface ShareSurveyButtonsProps {
  definition: SurveyDefinition;
  title?: string;
  description?: string;
  compact?: boolean;
}

export const ShareSurveyButtons = ({
  definition,
  title = 'Compartir encuesta',
  description = 'Compartí este enlace público. Funciona en celular, tablet y computadora desde cualquier lugar.',
  compact = false,
}: ShareSurveyButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const surveyUrl = getSurveyShareUrl(definition);

  const handleCopy = async () => {
    try {
      await copySurveyLink(definition, surveyUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Paper
      sx={{
        p: compact ? 2 : { xs: 2.5, md: 3 },
        border: '1px solid #F3F4F6',
        bgcolor: compact ? '#FAFAFA' : '#FFFFFF',
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant={compact ? 'body1' : 'h3'} sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          {!compact && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>

        <TextField
          value={surveyUrl}
          size="small"
          fullWidth
          InputProps={{ readOnly: true }}
          label="Enlace público de la encuesta"
          helperText="Este enlace funciona en celular, tablet y computadora."
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
          <Button
            component="a"
            href={getWhatsAppShareUrl(definition, surveyUrl)}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<ShareOutlinedIcon />}
            sx={{ flex: { sm: 1 } }}
          >
            WhatsApp
          </Button>
          <Button
            component="a"
            href={getEmailShareUrl(definition, surveyUrl)}
            variant="outlined"
            startIcon={<EmailOutlinedIcon />}
            sx={{ flex: { sm: 1 } }}
          >
            Email
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => void handleCopy()}
            sx={{ flex: { sm: 1 } }}
          >
            {copied ? 'Enlace copiado' : 'Copiar enlace'}
          </Button>
        </Stack>

        {copied && (
          <Alert severity="success" sx={{ py: 0.5 }}>
            El enlace quedó copiado. Ya podés pegarlo en WhatsApp, email u otro chat.
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};
