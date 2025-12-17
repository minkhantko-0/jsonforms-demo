import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Workflow {
  id: string;
  name: string;
  description: string;
}

export const AuthorizedWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/workflows');
        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }
        const data = await response.json();
        setWorkflows(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Authorized Workflows
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        View all available approval workflows in the system
      </Typography>

      <Grid container spacing={3}>
        {workflows.map(workflow => (
          <Grid item xs={12} md={6} lg={4} key={workflow.id}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="h6" component="div">
                    {workflow.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {workflow.description}
                </Typography>
                <Chip label={workflow.id} size="small" variant="outlined" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {workflows.length === 0 && (
        <Alert severity="info">No workflows available</Alert>
      )}
    </Box>
  );
};
