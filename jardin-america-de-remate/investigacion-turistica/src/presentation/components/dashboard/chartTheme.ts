export const CHART_COLORS = [
  '#111111',
  '#374151',
  '#4B5563',
  '#6B7280',
  '#9CA3AF',
  '#D1D5DB',
  '#E5E7EB',
];

export const SCALE_COLORS = ['#FCA5A5', '#FDBA74', '#FDE047', '#86EFAC', '#4ADE80'];

export const CHART_TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  fontSize: 13,
};

export const truncateLabel = (label: string, maxLength = 36): string =>
  label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
