import { Paper, Typography } from '@mui/material';

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
}

export const StatCard = ({ label, value, helper }: StatCardProps) => (
  <Paper sx={{ p: 3, height: '100%' }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 600, mb: helper ? 0.5 : 0 }}>
      {value}
    </Typography>
    {helper && (
      <Typography variant="body2" color="text.secondary">
        {helper}
      </Typography>
    )}
  </Paper>
);
