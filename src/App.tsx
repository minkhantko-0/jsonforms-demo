import './App.css';
import { Header } from './components/Header';
import { JsonFormsDemo } from './components/JsonFormsDemo';
import { ViewSubmissions } from './components/ViewSubmissions';
import { useState } from 'react';
import { Button, Box } from '@mui/material';

const App = () => {
  const [page, setPage] = useState<'form' | 'view'>('form');

  return (
    <>
      <Header />
      <Box display="flex" justifyContent="center" gap={2} p={2}>
        <Button
          variant={page === 'form' ? 'contained' : 'outlined'}
          onClick={() => setPage('form')}>
          Form
        </Button>
        <Button
          variant={page === 'view' ? 'contained' : 'outlined'}
          onClick={() => setPage('view')}>
          View Submissions
        </Button>
      </Box>
      {page === 'form' ? <JsonFormsDemo /> : <ViewSubmissions />}
    </>
  );
};

export default App;
