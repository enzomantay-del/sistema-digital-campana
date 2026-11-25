import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingScreen = ({ message = 'Cargando...' }: { message?: string }) => (
  <Box
    sx={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    }}
  >
    <CircularProgress size={32} sx={{ color: '#111' }} />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
);
