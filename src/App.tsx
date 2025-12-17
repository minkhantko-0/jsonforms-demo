import './App.css';
import { Header } from './components/Header';
import { JsonFormsDemo } from './components/JsonFormsDemo';
import { ViewSubmissions } from './components/ViewSubmissions';
import { AuthorizedWorkflows } from './components/AuthorizedWorkflows';
import { useState } from 'react';
import { Button, Box } from '@mui/material';

const App = () => {
  const [page, setPage] = useState<'form' | 'view' | 'workflows'>('form');

  return (
    <div className="App">
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
        <Button
          variant={page === 'workflows' ? 'contained' : 'outlined'}
          onClick={() => setPage('workflows')}>
          Authorized Workflows
        </Button>
      </Box>
      {page === 'form' ? (
        <JsonFormsDemo />
      ) : page === 'view' ? (
        <ViewSubmissions />
      ) : (
        <AuthorizedWorkflows />
      )}
    </div>
  );
};

export default App;
