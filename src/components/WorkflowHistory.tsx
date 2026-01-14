import { FC, useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, FileText, Clock, User } from 'lucide-react';
import {
  WorkflowStageVisualizer,
  WorkflowStage,
} from './WorkflowStageVisualizer';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Paper,
} from '@mui/material';

interface WorkflowHistory {
  id: number;
  submissionId: number;
  workflowName: string;
  currentStage: string;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  stages: WorkflowStage[];
  createdAt: string;
  updatedAt: string;
}

interface Submission {
  id: number;
  data: Record<string, unknown>;
  createdAt: string;
  workflowHistory?: WorkflowHistory;
}

export const WorkflowHistory: FC = () => {
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<number>>(
    new Set(),
  );

  // Generate static mock submissions for UI demonstration
  const submissions = useMemo(() => {
    const mockSubmissions: Submission[] = [
      {
        id: 1,
        data: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          department: 'Operations',
          requestType: 'Budget Approval',
          amount: 15000,
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        data: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          department: 'Security',
          requestType: 'Access Request',
          priority: 'High',
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        data: {
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          department: 'IT',
          requestType: 'Resource Allocation',
          resources: ['Laptop', 'Monitor', 'Software License'],
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        data: {
          name: 'Alice Brown',
          email: 'alice.brown@example.com',
          department: 'HR',
          requestType: 'Policy Change',
          description: 'Update remote work policy',
        },
        createdAt: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: 5,
        data: {
          name: 'Charlie Wilson',
          email: 'charlie.wilson@example.com',
          department: 'Marketing',
          requestType: 'Campaign Approval',
          budget: 25000,
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return mockSubmissions.map(submission => ({
      ...submission,
      workflowHistory: generateMockWorkflowHistory(submission),
    }));
  }, []);

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSubmissions(newExpanded);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}>
        <Typography variant="h4" fontWeight="bold">
          Workflow History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Submissions: {submissions.length}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {submissions.map((submission: Submission) => {
          const isExpanded = expandedSubmissions.has(submission.id);
          const history = submission.workflowHistory;

          return (
            <Card key={submission.id} elevation={2}>
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => toggleExpanded(submission.id)}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flex: 1,
                  }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <FileText size={20} color="#0284c7" />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="h6">
                        Submission #{submission.id}
                      </Typography>
                      {history && (
                        <Chip
                          label={history.status.toUpperCase()}
                          color={
                            history.status === 'completed'
                              ? 'success'
                              : history.status === 'active'
                                ? 'primary'
                                : history.status === 'failed'
                                  ? 'error'
                                  : 'default'
                          }
                          size="small"
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mt: 0.5,
                      }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}>
                        <Clock size={14} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(submission.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      {history && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}>
                          <User size={14} />
                          <Typography variant="body2" color="text.secondary">
                            Workflow: {history.workflowName}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>

                <IconButton>
                  {isExpanded ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </IconButton>
              </CardContent>

              {isExpanded && history && (
                <Collapse in={isExpanded}>
                  <Box
                    sx={{
                      bgcolor: 'background.default',
                      p: 3,
                      borderTop: 1,
                      borderColor: 'divider',
                    }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom>
                      Current Stage: {history.currentStage}
                    </Typography>

                    <WorkflowStageVisualizer
                      stages={history.stages}
                      currentStageKey={history.currentStage}
                    />

                    <Box
                      sx={{
                        mt: 4,
                        pt: 4,
                        borderTop: 1,
                        borderColor: 'divider',
                      }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom>
                        Submission Data
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                        <pre
                          style={{
                            fontSize: 12,
                            overflow: 'auto',
                            maxHeight: 250,
                            margin: 0,
                          }}>
                          {JSON.stringify(submission.data, null, 2)}
                        </pre>
                      </Paper>
                    </Box>
                  </Box>
                </Collapse>
              )}
            </Card>
          );
        })}
      </Box>

      {submissions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <FileText size={64} color="#ccc" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No submissions found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Submit a form first to see workflow history
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Mock function to generate workflow history based on actual parallel workflow structure
function generateMockWorkflowHistory(submission: Submission): WorkflowHistory {
  const submissionDate = new Date(submission.createdAt);

  // Determine workflow status based on submission ID
  const statusType = submission.id % 4;

  // Time helpers
  const addMinutes = (date: Date, minutes: number) =>
    new Date(date.getTime() + minutes * 60 * 1000).toISOString();
  const addHours = (date: Date, hours: number) =>
    new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();

  const workflowName =
    'Parallel Workflow (Manager + Senior Manager) from Two Departments';
  let stages: WorkflowStage[];
  let currentStage: string;
  let status: 'active' | 'completed' | 'failed' | 'cancelled';

  // Scenario 1: Completed workflow - both approvals granted
  if (statusType === 0) {
    status = 'completed';
    currentStage = 'end';
    stages = [
      {
        key: 'start',
        name: 'Workflow Started',
        type: 'start',
        status: 'completed',
        startedAt: submissionDate.toISOString(),
        completedAt: submissionDate.toISOString(),
        description: 'Workflow initiated successfully',
      },
      {
        key: 'notify_operation_manager',
        name: 'Notify Operation Manager',
        type: 'service',
        status: 'completed',
        startedAt: addMinutes(submissionDate, 1),
        completedAt: addMinutes(submissionDate, 2),
        description: 'Notification sent to Operation Manager',
      },
      {
        key: 'notify_security_manager',
        name: 'Notify Security Manager',
        type: 'service',
        status: 'completed',
        startedAt: addMinutes(submissionDate, 1),
        completedAt: addMinutes(submissionDate, 2),
        description: 'Notification sent to Security Manager',
      },
      {
        key: 'operation_manager_approval',
        name: 'Operation Manager Approval',
        type: 'task',
        status: 'completed',
        assignedTo: 'Operation Manager (Manager Role)',
        startedAt: addMinutes(submissionDate, 2),
        completedAt: addHours(submissionDate, 8),
        description: 'Operation department manager approval - APPROVED',
      },
      {
        key: 'security_manager_approval',
        name: 'Security Manager Approval',
        type: 'task',
        status: 'completed',
        assignedTo: 'Security Manager (Senior Manager Role)',
        startedAt: addMinutes(submissionDate, 2),
        completedAt: addHours(submissionDate, 12),
        description: 'Security department senior manager approval - APPROVED',
      },
      {
        key: 'first_gateway_join',
        name: 'Parallel Gateway Join',
        type: 'task',
        status: 'completed',
        startedAt: addHours(submissionDate, 12),
        completedAt: addHours(submissionDate, 12),
        description:
          'Both branches completed - Condition met (at least one approval)',
      },
      {
        key: 'send_approved_noti',
        name: 'Send Approval Notification',
        type: 'service',
        status: 'completed',
        startedAt: addHours(submissionDate, 12),
        completedAt: addHours(submissionDate, 12),
        description: 'Approval notification sent to requester',
      },
      {
        key: 'process_csv',
        name: 'Process CSV Data',
        type: 'service',
        status: 'completed',
        startedAt: addHours(submissionDate, 12),
        completedAt: addHours(submissionDate, 13),
        description: 'CSV data processing completed',
      },
      {
        key: 'end',
        name: 'Workflow Completed',
        type: 'end',
        status: 'completed',
        startedAt: addHours(submissionDate, 13),
        completedAt: addHours(submissionDate, 13),
        description: 'Workflow completed successfully',
      },
    ];
  }
  // Scenario 2: In Progress - Waiting for approvals
  else if (statusType === 1) {
    status = 'active';
    currentStage = 'operation_manager_approval';
    stages = [
      {
        key: 'start',
        name: 'Workflow Started',
        type: 'start',
        status: 'completed',
        startedAt: submissionDate.toISOString(),
        completedAt: submissionDate.toISOString(),
        description: 'Workflow initiated successfully',
      },
      {
        key: 'notify_operation_manager',
        name: 'Notify Operation Manager',
        type: 'service',
        status: 'completed',
        startedAt: addMinutes(submissionDate, 1),
        completedAt: addMinutes(submissionDate, 2),
        description: 'Notification sent to Operation Manager',
      },
      {
        key: 'notify_security_manager',
        name: 'Notify Security Manager',
        type: 'service',
        status: 'completed',
        startedAt: addMinutes(submissionDate, 1),
        completedAt: addMinutes(submissionDate, 2),
        description: 'Notification sent to Security Manager',
      },
      {
        key: 'operation_manager_approval',
        name: 'Operation Manager Approval',
        type: 'task',
        status: 'in-progress',
        assignedTo: 'Operation Manager (Manager Role)',
        startedAt: addMinutes(submissionDate, 2),
        description: 'Awaiting approval from Operation Manager',
      },
      {
        key: 'security_manager_approval',
        name: 'Security Manager Approval',
        type: 'task',
        status: 'in-progress',
        assignedTo: 'Security Manager (Senior Manager Role)',
        startedAt: addMinutes(submissionDate, 2),
        description: 'Awaiting approval from Security Manager',
      },
      {
        key: 'first_gateway_join',
        name: 'Parallel Gateway Join',
        type: 'task',
        status: 'pending',
        description: 'Waiting for at least one approval',
      },
      {
        key: 'end',
        name: 'Workflow Completed',
        type: 'end',
        status: 'pending',
        description: 'Pending workflow completion',
      },
    ];
  }
  // Scenario 3: In Progress - One approval granted, processing CSV
  else if (statusType === 2) {
    status = 'active';
    currentStage = 'process_csv';
    stages = [
      {
        key: 'start',
        name: 'Workflow Started',
        type: 'start',
        status: 'completed',
        startedAt: submissionDate.toISOString(),
        completedAt: submissionDate.toISOString(),
        description: 'Workflow initiated successfully',
      },
      {
        key: 'notify_operation_manager',
        name: 'Notify Operation Manager',
        type: 'service',
        status: 'completed',
        startedAt: addMinutes(submissionDate, 1),
        completedAt: addMinutes(submissionDate, 2),
        description: 'Notification sent to Operation Manager',
      },
      {
        key: 'notify_security_manager',
        name: 'Notify Security Manager',
        type: 'service',
        status: 'completed',
        startedAt: addMinutes(submissionDate, 1),
        completedAt: addMinutes(submissionDate, 2),
        description: 'Notification sent to Security Manager',
      },
      {
        key: 'operation_manager_approval',
        name: 'Operation Manager Approval',
        type: 'task',
        status: 'completed',
        assignedTo: 'Operation Manager (Manager Role)',
        startedAt: addMinutes(submissionDate, 2),
        completedAt: addHours(submissionDate, 6),
        description: 'Operation department manager approval - APPROVED',
      },
      {
        key: 'security_manager_approval',
        name: 'Security Manager Approval',
        type: 'task',
        status: 'completed',
        assignedTo: 'Security Manager (Senior Manager Role)',
        startedAt: addMinutes(submissionDate, 2),
        completedAt: addHours(submissionDate, 4),
        description: 'Security department senior manager approval - REJECTED',
      },
      {
        key: 'first_gateway_join',
        name: 'Parallel Gateway Join',
        type: 'task',
        status: 'completed',
        startedAt: addHours(submissionDate, 6),
        completedAt: addHours(submissionDate, 6),
        description:
          'Condition met - Operation Manager approved (one approval required)',
      },
      {
        key: 'send_approved_noti',
        name: 'Send Approval Notification',
        type: 'service',
        status: 'completed',
        startedAt: addHours(submissionDate, 6),
        completedAt: addHours(submissionDate, 6),
        description: 'Approval notification sent',
      },
      {
        key: 'process_csv',
        name: 'Process CSV Data',
        type: 'service',
        status: 'in-progress',
        startedAt: addHours(submissionDate, 6),
        description: 'Currently processing CSV data',
      },
      {
        key: 'end',
        name: 'Workflow Completed',
        type: 'end',
        status: 'pending',
        description: 'Pending CSV processing completion',
      },
    ];
  }
  // Scenario 4: Failed - Both approvals rejected
  else {
    status = 'failed';
    currentStage = 'send_rejected_noti';
    stages = [
      {
        key: 'start',
        name: 'Workflow Started',
        type: 'start',
        status: 'completed',
        startedAt: submissionDate.toISOString(),
        completedAt: submissionDate.toISOString(),
        description: 'Workflow initiated successfully',
      },
      {
        key: 'notify_operation_manager',
        name: 'Notify Operation Manager',
        type: 'service',
        status: 'completed',
        startedAt: addMinutes(submissionDate, 1),
        completedAt: addMinutes(submissionDate, 2),
        description: 'Notification sent to Operation Manager',
      },
      {
        key: 'notify_security_manager',
        name: 'Notify Security Manager',
        type: 'service',
        status: 'completed',
        startedAt: addMinutes(submissionDate, 1),
        completedAt: addMinutes(submissionDate, 2),
        description: 'Notification sent to Security Manager',
      },
      {
        key: 'operation_manager_approval',
        name: 'Operation Manager Approval',
        type: 'task',
        status: 'failed',
        assignedTo: 'Operation Manager (Manager Role)',
        startedAt: addMinutes(submissionDate, 2),
        completedAt: addHours(submissionDate, 5),
        description: 'Operation Manager REJECTED the request',
      },
      {
        key: 'security_manager_approval',
        name: 'Security Manager Approval',
        type: 'task',
        status: 'failed',
        assignedTo: 'Security Manager (Senior Manager Role)',
        startedAt: addMinutes(submissionDate, 2),
        completedAt: addHours(submissionDate, 7),
        description: 'Security Manager REJECTED the request',
      },
      {
        key: 'send_rejected_noti',
        name: 'Send Rejection Notification',
        type: 'service',
        status: 'completed',
        startedAt: addHours(submissionDate, 7),
        completedAt: addHours(submissionDate, 7),
        description: 'Rejection notification sent - Both managers rejected',
      },
      {
        key: 'end',
        name: 'Workflow Terminated',
        type: 'end',
        status: 'failed',
        startedAt: addHours(submissionDate, 7),
        completedAt: addHours(submissionDate, 7),
        description: 'Workflow terminated due to rejections',
      },
    ];
  }

  return {
    id: submission.id,
    submissionId: submission.id,
    workflowName,
    currentStage,
    status,
    stages,
    createdAt: submission.createdAt,
    updatedAt: new Date().toISOString(),
  };
}
