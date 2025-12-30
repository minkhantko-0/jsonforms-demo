import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';

interface EdgeConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (expression: string) => void;
  initialExpression?: string;
}

export function EdgeConfigDialog({
  open,
  onClose,
  onSave,
  initialExpression = '',
}: EdgeConfigDialogProps) {
  const [expression, setExpression] = useState(initialExpression);

  useEffect(() => {
    setExpression(initialExpression);
  }, [initialExpression, open]);

  const handleSave = () => {
    onSave(expression);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configure Transition Condition</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Enter a JEXL expression for this transition. Leave empty for
            unconditional transitions.
          </Typography>

          <TextField
            label="JEXL Expression"
            value={expression}
            onChange={e => setExpression(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="variables.outputs.first_approval.isApproved == true"
            helperText="Example: variables.outputs.node_key.isApproved == true"
          />

          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Common patterns:
            </Typography>
            <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
              • Approval:{' '}
              <code>variables.outputs.NODE_KEY.isApproved == true</code>
            </Typography>
            <Typography variant="caption" component="div">
              • Rejection:{' '}
              <code>variables.outputs.NODE_KEY.isApproved == false</code>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
