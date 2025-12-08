import { FC } from 'react';
import { InputLabel, Slider } from '@mui/material';

interface AgeSliderProps {
  value: number;
  updateValue: (newValue: number) => void;
  label?: string;
  min?: number;
  max?: number;
}

export const AgeSlider: FC<AgeSliderProps> = ({ value, updateValue, label, min = 0, max = 100 }) => {
  return (
    <div style={{ marginTop: '0.8em' }}>
      <InputLabel shrink>
        {label || 'Age'}: {value || min}
      </InputLabel>
      <Slider
        value={value || min}
        onChange={(_, newValue) => updateValue(newValue as number)}
        min={min}
        max={max}
        valueLabelDisplay="auto"
      />
    </div>
  );
};
