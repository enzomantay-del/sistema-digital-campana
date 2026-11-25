import { Box, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AnalyzedOption } from '@/domain/entities/SurveyAnalysis';
import type { QuestionAnalysis } from '@/domain/entities/SurveyAnalysis';
import {
  CHART_COLORS,
  SCALE_COLORS,
  truncateLabel,
} from '@/presentation/components/dashboard/chartTheme';

interface QuestionChartProps {
  analysis: QuestionAnalysis;
}

interface ChartDatum {
  label: string;
  shortLabel: string;
  count: number;
  percentage: number;
}

const toChartData = (options: AnalyzedOption[]): ChartDatum[] =>
  options.map((option) => ({
    label: option.label,
    shortLabel: truncateLabel(option.label),
    count: option.count,
    percentage: option.percentage,
  }));

const EmptyChart = () => (
  <Box sx={{ py: 4, textAlign: 'center' }}>
    <Typography variant="body2" color="text.secondary">
      Sin respuestas aún
    </Typography>
  </Box>
);

const ChartTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}) => {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        bgcolor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        maxWidth: 280,
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
        {item.label}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {item.count} respuesta{item.count === 1 ? '' : 's'} ({item.percentage}%)
      </Typography>
    </Box>
  );
};

const DonutChart = ({ data }: { data: ChartDatum[] }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return <EmptyChart />;

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="46%"
            innerRadius={58}
            outerRadius={92}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="#FFFFFF" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={(value: string) => truncateLabel(value, 48)}
            wrapperStyle={{ fontSize: 12, lineHeight: '18px', paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

const HorizontalBarChart = ({ data }: { data: ChartDatum[] }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return <EmptyChart />;

  const height = Math.min(Math.max(data.length * 46, 200), 460);

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
          <YAxis
            type="category"
            dataKey="shortLabel"
            width={150}
            tick={{ fontSize: 11, fill: '#374151' }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(17,17,17,0.04)' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

const ScaleBarChart = ({ data, average }: { data: ChartDatum[]; average?: number }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return <EmptyChart />;

  return (
    <Box>
      {average !== undefined && (
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1.25,
            borderRadius: 2,
            bgcolor: '#F9FAFB',
            border: '1px solid #F3F4F6',
            display: 'inline-flex',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Promedio: {average} / 5
          </Typography>
        </Box>
      )}
      <Box sx={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="shortLabel" tick={{ fontSize: 11, fill: '#6B7280' }} interval={0} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(17,17,17,0.04)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={SCALE_COLORS[index % SCALE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        1 = Totalmente en desacuerdo · 5 = Totalmente de acuerdo
      </Typography>
    </Box>
  );
};

const VerticalBarChart = ({ data }: { data: ChartDatum[] }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return <EmptyChart />;

  return (
    <Box sx={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis
            dataKey="shortLabel"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            angle={-18}
            textAnchor="end"
            interval={0}
            height={56}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(17,17,17,0.04)' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

const pickChartKind = (analysis: QuestionAnalysis): 'donut' | 'horizontal' | 'scale' | 'vertical' => {
  if (analysis.type === 'scale') return 'scale';
  if (analysis.type === 'checkbox') return 'horizontal';
  if (analysis.type === 'filter') return 'donut';
  if (analysis.options.length <= 3) return 'donut';
  if (analysis.options.length >= 6) return 'horizontal';
  return 'vertical';
};

export const QuestionChart = ({ analysis }: QuestionChartProps) => {
  const data = toChartData(analysis.options);
  const kind = pickChartKind(analysis);

  switch (kind) {
    case 'donut':
      return <DonutChart data={data} />;
    case 'horizontal':
      return <HorizontalBarChart data={data} />;
    case 'scale':
      return <ScaleBarChart data={data} average={analysis.average} />;
    default:
      return <VerticalBarChart data={data} />;
  }
};
