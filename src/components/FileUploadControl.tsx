import { withJsonFormsControlProps } from '@jsonforms/react';
import { Button, Box, Typography } from '@mui/material';

interface FileUploadControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
  label?: string;
}

const FileUploadControl = ({ data, handleChange, path, label }: FileUploadControlProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange(path, file);
    }
  };

  const fileName = data instanceof File ? data.name : (typeof data === 'string' ? data : '');

  return (
    <Box mt={2}>
      <Typography variant="body2" mb={1}>{label || 'File Upload'}</Typography>
      <Button variant="contained" component="label">
        Choose File
        <input type="file" hidden onChange={handleFileChange} />
      </Button>
      {fileName && (
        <Typography variant="body2" mt={1}>
          {data instanceof File ? `Selected: ${fileName}` : (
            <a href={fileName} target="_blank" rel="noopener noreferrer">{fileName}</a>
          )}
        </Typography>
      )}
    </Box>
  );
};

const FileUploadControlWithJsonForms = withJsonFormsControlProps(FileUploadControl);
export default FileUploadControlWithJsonForms;
