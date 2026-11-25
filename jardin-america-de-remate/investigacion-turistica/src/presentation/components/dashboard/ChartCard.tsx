import { Paper, Typography, Box } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ChartCardProps {
  title: string;
  data: Record<string, number>;
  color?: string;
}

const COLORS = ['#111111', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB'];

export const ChartCard = ({ title, data, color = '#111111' }: ChartCardProps) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h3" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">Sin datos aún</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              angle={-25}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={color === '#111111' ? COLORS[index % COLORS.length] : color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
