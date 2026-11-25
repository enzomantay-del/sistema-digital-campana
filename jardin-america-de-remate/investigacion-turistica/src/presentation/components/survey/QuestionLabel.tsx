import { Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface QuestionLabelProps {
  number: number;
  label: string;
  required?: boolean;
  size?: 'md' | 'lg';
  labelEmphasis?: string;
}

const renderLabelText = (label: string, labelEmphasis?: string): ReactNode => {
  if (!labelEmphasis || !label.includes(labelEmphasis)) {
    return label;
  }

  const parts = label.split(labelEmphasis);

  return parts.flatMap((part, index) => {
    const nodes: ReactNode[] = [part];
    if (index < parts.length - 1) {
      nodes.push(
        <Typography
          key={`emphasis-${index}`}
          component="span"
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          {labelEmphasis}
        </Typography>,
      );
    }
    return nodes;
  });
};

export const QuestionLabel = ({
  number,
  label,
  required,
  size = 'md',
  labelEmphasis,
}: QuestionLabelProps) => (
  <>
    <Typography
      component="span"
      sx={{
        fontWeight: 600,
        mr: 0.75,
        fontSize: size === 'lg' ? '1.125rem' : '1rem',
      }}
    >
      {number}.
    </Typography>
    {renderLabelText(label, labelEmphasis)}
    {required && (
      <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
        *
      </Typography>
    )}
  </>
);
