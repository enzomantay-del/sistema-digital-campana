import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import type { SurveyAnswers, SurveyQuestion } from '@/domain/entities/Survey';
import { QuestionLabel } from '@/presentation/components/survey/QuestionLabel';

interface QuestionFieldProps {
  question: SurveyQuestion;
  number: number;
  control: Control<SurveyAnswers>;
  errors: FieldErrors<SurveyAnswers>;
}

export const QuestionField = ({ question, number, control, errors }: QuestionFieldProps) => {
  const error = errors[question.id];
  const errorMessage = error?.message as string | undefined;

  return (
    <Box sx={{ mb: 4 }}>
      <FormLabel
        component="legend"
        sx={{
          display: 'block',
          mb: 1.5,
          color: 'text.primary',
          fontWeight: 500,
          fontSize: '1rem',
          lineHeight: 1.5,
        }}
      >
        <QuestionLabel
          number={number}
          label={question.label}
          required={question.required}
          labelEmphasis={question.labelEmphasis}
        />
      </FormLabel>

      {question.helperText && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {question.helperText}
        </Typography>
      )}

      <Controller
        name={question.id}
        control={control}
        rules={{
          required: question.required ? 'Este campo es obligatorio' : false,
          validate: (value) => {
            if (!question.required) return true;
            if (Array.isArray(value)) {
              if (value.length === 0) return 'Seleccioná al menos una opción';
              if (question.maxSelections && value.length > question.maxSelections) {
                return `Seleccioná hasta ${question.maxSelections} opciones`;
              }
              return true;
            }
            if (typeof value === 'string') return value.trim().length > 0 || 'Este campo es obligatorio';
            return 'Este campo es obligatorio';
          },
        }}
        render={({ field }) => {
          switch (question.type) {
            case 'radio':
              return (
                <FormControl error={Boolean(errorMessage)} fullWidth>
                  <RadioGroup
                    name={field.name}
                    value={field.value ?? ''}
                    onChange={(_, value) => field.onChange(value)}
                    onBlur={field.onBlur}
                  >
                    {question.options?.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio size="small" />}
                        label={option.label}
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </RadioGroup>
                  {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
                </FormControl>
              );

            case 'checkbox':
              return (
                <FormControl error={Boolean(errorMessage)} fullWidth>
                  <FormGroup>
                    {question.options?.map((option) => {
                      const selected = Array.isArray(field.value) ? field.value : [];
                      const checked = selected.includes(option.value);
                      const maxReached =
                        Boolean(question.maxSelections) &&
                        selected.length >= (question.maxSelections ?? 0) &&
                        !checked;

                      return (
                        <FormControlLabel
                          key={option.value}
                          control={
                            <Checkbox
                              size="small"
                              checked={checked}
                              disabled={maxReached}
                              onChange={() => {
                                if (checked) {
                                  field.onChange(selected.filter((v) => v !== option.value));
                                } else if (!maxReached) {
                                  field.onChange([...selected, option.value]);
                                }
                                field.onBlur();
                              }}
                              sx={{
                                color: '#D1D5DB',
                                '&.Mui-checked': { color: '#111' },
                              }}
                            />
                          }
                          label={option.label}
                          sx={{ mb: 0.5 }}
                        />
                      );
                    })}
                  </FormGroup>
                  {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
                </FormControl>
              );

            case 'select':
              return (
                <FormControl fullWidth error={Boolean(errorMessage)}>
                  <Select
                    name={field.name}
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    displayEmpty
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="" disabled>
                      Seleccioná una opción
                    </MenuItem>
                    {question.options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
                </FormControl>
              );

            case 'scale':
              return (
                <FormControl error={Boolean(errorMessage)} fullWidth>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Button
                        key={num}
                        variant={field.value === String(num) ? 'contained' : 'outlined'}
                        onClick={() => {
                          field.onChange(String(num));
                          field.onBlur();
                        }}
                        sx={{ minWidth: 48, height: 48, borderRadius: 2 }}
                      >
                        {num}
                      </Button>
                    ))}
                  </Box>
                  {errorMessage && <FormHelperText sx={{ mt: 1 }}>{errorMessage}</FormHelperText>}
                </FormControl>
              );

            case 'textarea':
              return (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Escribí tu respuesta aquí..."
                  error={Boolean(errorMessage)}
                  helperText={errorMessage}
                />
              );

            default:
              return <></>;
          }
        }}
      />
    </Box>
  );
};
