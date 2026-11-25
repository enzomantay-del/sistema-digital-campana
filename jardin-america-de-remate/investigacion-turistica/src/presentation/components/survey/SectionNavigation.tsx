import { Box, Button, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface SectionNavigationProps {
  onBack?: () => void;
  isFirst: boolean;
  isLast: boolean;
  loading?: boolean;
}

export const SectionNavigation = ({
  onBack,
  isFirst,
  isLast,
  loading,
}: SectionNavigationProps) => (
  <Stack
    direction={{ xs: 'column-reverse', sm: 'row' }}
    justifyContent="space-between"
    alignItems={{ xs: 'stretch', sm: 'center' }}
    spacing={2}
    sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}
  >
    <Box>
      {!isFirst && onBack && (
        <Button
          type="button"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          disabled={loading}
        >
          Anterior
        </Button>
      )}
    </Box>
    <Button
      type="submit"
      variant="contained"
      endIcon={!isLast ? <ArrowForwardIcon /> : undefined}
      disabled={loading}
      sx={{ minWidth: { sm: 160 } }}
    >
      {isLast ? 'Enviar respuestas' : 'Continuar'}
    </Button>
  </Stack>
);
