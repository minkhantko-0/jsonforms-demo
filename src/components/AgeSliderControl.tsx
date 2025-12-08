import { withJsonFormsControlProps } from '@jsonforms/react';
import { AgeSlider } from './AgeSlider';

interface AgeSliderControlProps {
  data: number;
  handleChange(path: string, value: number): void;
  path: string;
  label?: string;
  schema?: any;
}

const AgeSliderControl = ({ data, handleChange, path, label, schema }: AgeSliderControlProps) => (
  <AgeSlider
    value={data}
    updateValue={(newValue: number) => handleChange(path, newValue)}
    label={label}
    min={schema?.minimum}
    max={schema?.maximum}
  />
);

const AgeSliderControlWithJsonForms = withJsonFormsControlProps(AgeSliderControl);
export default AgeSliderControlWithJsonForms;
