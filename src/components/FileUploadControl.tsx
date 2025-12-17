import { withJsonFormsControlProps } from '@jsonforms/react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { useState } from 'react';

interface FileUploadControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
  label?: string;
}

const FileUploadControl = ({
  data,
  handleChange,
  path,
  label,
}: FileUploadControlProps) => {
  const [error, setError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Only CSV files are allowed');
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError('File size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }

      handleChange(path, file);
    }
  };

  const fileName =
    data instanceof File ? data.name : typeof data === 'string' ? data : '';

  return (
    <Box mt={2}>
      <Typography variant="body2" mb={1}>
        {label || 'File Upload'}
      </Typography>
      <Button variant="contained" component="label">
        Choose File
        <input type="file" accept=".csv" hidden onChange={handleFileChange} />
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      {fileName && !error && (
        <Typography variant="body2" mt={1} color="success.main">
          {data instanceof File ? (
            `✓ Selected: ${fileName}`
          ) : (
            <a href={fileName} target="_blank" rel="noopener noreferrer">
              {fileName}
            </a>
          )}
        </Typography>
      )}
    </Box>
  );
};

const FileUploadControlWithJsonForms =
  withJsonFormsControlProps(FileUploadControl);
export default FileUploadControlWithJsonForms;
