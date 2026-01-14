# Workflow History & Stage Visualizer Guide

## Overview

The new workflow history system provides a comprehensive view of submission workflows with visual stage tracking. It includes:

1. **Modern UI Layout** - Clean sidebar navigation with Tailwind CSS and Lucide React icons
2. **Workflow History Component** - Track submission progress through workflow stages
3. **Stage Visualizer** - Visual timeline showing stage status and progression
4. **Backend API** - Complete CRUD operations for workflow history

---

## UI Restructuring

### New Layout Features

The application now features a **modern sidebar layout** with:

- **Collapsible Sidebar** - Toggle sidebar visibility
- **Icon Navigation** - Lucide React icons for better UX
- **Badge Notifications** - Unread count displayed on notifications menu
- **Connection Status** - Real-time connection indicator
- **Date Display** - Current date in the header
- **Responsive Design** - Mobile-friendly with Tailwind CSS

### Navigation Menu Items

1. **Submit Form** - Form submission interface
2. **View Submissions** - List all submissions
3. **Workflow History** ⭐ NEW - Track workflow progress
4. **Notifications** - View and manage notifications
5. **Workflow Management** - Manage workflows
6. **Workflow Builder** - Visual workflow designer
7. **SLA Setup** - Configure SLA timers

---

## Workflow History Features

### Display Capabilities

The Workflow History page shows:

- **Submission List** - All submissions with workflow status
- **Expandable Cards** - Click to expand and view details
- **Status Badges** - Visual indicators (Active, Completed, Failed, Cancelled)
- **Timeline View** - Visual progression through workflow stages
- **Stage Details** - Assigned users, timestamps, descriptions
- **Data Preview** - View submission data inline

### Stage Status Types

Each workflow stage can have one of these statuses:

- **Completed** ✅ - Stage successfully finished
- **In Progress** 🔵 - Currently active stage
- **Pending** ⚪ - Awaiting execution
- **Failed** ❌ - Stage encountered an error
- **Cancelled** ⚫ - Stage was cancelled

---

## Database Schema

### New Table: `workflow_history`

```sql
CREATE TABLE `workflow_history` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `submission_id` int NOT NULL,
  `workflow_definition_id` int,
  `workflow_name` varchar(255) NOT NULL,
  `current_stage` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL,
  `stages` json NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);
```

### Stage Data Structure

Each stage in the `stages` JSON field contains:

```typescript
{
  key: string;              // Unique identifier
  name: string;             // Display name
  type: 'start' | 'task' | 'decision' | 'service' | 'end';
  status: 'completed' | 'in-progress' | 'pending' | 'failed' | 'cancelled';
  assignedTo?: string;      // User assigned to this stage
  completedAt?: string;     // ISO timestamp
  startedAt?: string;       // ISO timestamp
  description?: string;     // Stage description
}
```

---

## API Endpoints

### Get All Workflow History

```
GET /api/workflow-history
Response: { success: true, data: WorkflowHistory[] }
```

### Get Workflow History by Submission

```
GET /api/workflow-history/submission/:submissionId
Response: { success: true, data: WorkflowHistory }
```

### Create Workflow History

```
POST /api/workflow-history
Body: {
  submissionId: number,
  workflowDefinitionId?: number,
  workflowName: string,
  currentStage: string,
  status: 'active' | 'completed' | 'failed' | 'cancelled',
  stages: WorkflowStage[]
}
Response: { success: true, id: number }
```

### Update Workflow History

```
PUT /api/workflow-history/:id
Body: {
  currentStage: string,
  status: string,
  stages: WorkflowStage[]
}
Response: { success: true }
```

### Get Submissions with Workflow

```
GET /api/submissions-with-workflow
Response: {
  success: true,
  data: Array<Submission & { workflowHistory: WorkflowHistory }>
}
```

---

## Integration Examples

### 1. Creating Workflow History on Submission

When a form is submitted, create workflow history:

```typescript
// In submit handler
const submission = await createSubmission(formData);

// Create initial workflow history
await fetch(`${API_URL}/api/workflow-history`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    submissionId: submission.id,
    workflowName: 'Standard Approval',
    currentStage: 'start',
    status: 'active',
    stages: [
      {
        key: 'start',
        name: 'Submission Received',
        type: 'start',
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      {
        key: 'review',
        name: 'Initial Review',
        type: 'task',
        status: 'in-progress',
        assignedTo: 'John Doe',
        startedAt: new Date().toISOString(),
      },
      {
        key: 'approval',
        name: 'Manager Approval',
        type: 'task',
        status: 'pending',
        assignedTo: 'Jane Smith',
      },
      {
        key: 'end',
        name: 'Completed',
        type: 'end',
        status: 'pending',
      },
    ],
  }),
});
```

### 2. Updating Workflow Stage

When a stage is completed:

```typescript
const updateWorkflowStage = async (historyId: number, newStage: string) => {
  // Fetch current history
  const response = await fetch(
    `${API_URL}/api/workflow-history/submission/${submissionId}`,
  );
  const { data: history } = await response.json();

  // Update stages
  const updatedStages = history.stages.map(stage => {
    if (stage.key === history.currentStage) {
      return {
        ...stage,
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
    }
    if (stage.key === newStage) {
      return {
        ...stage,
        status: 'in-progress',
        startedAt: new Date().toISOString(),
      };
    }
    return stage;
  });

  // Update history
  await fetch(`${API_URL}/api/workflow-history/${historyId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentStage: newStage,
      status: 'active',
      stages: updatedStages,
    }),
  });
};
```

### 3. Completing Workflow

When all stages are done:

```typescript
const completeWorkflow = async (historyId: number) => {
  const response = await fetch(
    `${API_URL}/api/workflow-history/submission/${submissionId}`,
  );
  const { data: history } = await response.json();

  const updatedStages = history.stages.map(stage => ({
    ...stage,
    status: stage.key === 'end' ? 'completed' : stage.status,
    completedAt:
      stage.key === 'end' ? new Date().toISOString() : stage.completedAt,
  }));

  await fetch(`${API_URL}/api/workflow-history/${historyId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentStage: 'end',
      status: 'completed',
      stages: updatedStages,
    }),
  });
};
```

---

## Visual Components

### WorkflowStageVisualizer

Displays a vertical timeline with:

- **Progress Line** - Connects stages visually
- **Stage Icons** - Different icons for each status
- **Color Coding** - Green (completed), Blue (in-progress), Red (failed), Gray (pending/cancelled)
- **Stage Cards** - Show name, description, assigned user, and timestamps
- **Highlight Current** - Current stage has a ring highlight

### WorkflowHistory

Main container that:

- **Fetches Data** - Loads submissions with workflow history
- **Expandable List** - Click to expand/collapse details
- **Status Display** - Shows overall workflow status
- **Embedded Visualizer** - Uses WorkflowStageVisualizer component
- **Data Preview** - Shows submission data in JSON format

---

## Customization

### Styling with Tailwind

The components use Tailwind CSS classes. Customize by modifying:

```typescript
// In tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        // ... customize colors
        600: '#0284c7',
      },
    },
  },
}
```

### Adding Custom Stage Types

To add new stage types, update the type definitions:

```typescript
// In WorkflowStageVisualizer.tsx
type: 'start' | 'task' | 'decision' | 'service' | 'end' | 'approval' | 'custom';
```

Then add icons and colors in `getStatusIcon()` and `getStatusColor()`.

---

## Best Practices

### 1. Initialize Workflow History on Submission

Always create workflow history when a form is submitted.

### 2. Update Stages Atomically

Use transactions when updating stage status to prevent race conditions.

### 3. Store Timestamps

Always record `startedAt` and `completedAt` for audit trails.

### 4. Use Descriptive Stage Names

Make stage names user-friendly: "Manager Approval" not "stage_3".

### 5. Handle Errors Gracefully

Set stage status to 'failed' and log errors for debugging.

### 6. Implement Notifications

Send notifications when stages change or require action.

---

## Migration Steps

To apply the database changes:

```bash
# Navigate to server directory
cd server

# Run migrations
npm run db:push

# Or manually run the SQL file
mysql -u your_user -p your_database < drizzle/0002_add_workflow_history_table.sql
```

---

## Testing

### Manual Testing Steps

1. **Submit a Form** - Create a new submission
2. **Navigate to Workflow History** - Click the new menu item
3. **Expand a Submission** - Click to view workflow stages
4. **Verify Visual Timeline** - Check stage colors and icons
5. **Test API Endpoints** - Use Postman or curl to test CRUD operations

### Test API with curl

```bash
# Create workflow history
curl -X POST http://localhost:3001/api/workflow-history \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": 1,
    "workflowName": "Test Workflow",
    "currentStage": "review",
    "status": "active",
    "stages": [...]
  }'

# Get workflow history
curl http://localhost:3001/api/workflow-history

# Get by submission
curl http://localhost:3001/api/workflow-history/submission/1
```

---

## Troubleshooting

### Issue: Workflow History Not Displaying

**Solution**: Check that:

1. Migration has been run
2. Backend server is running on port 3001
3. API endpoint returns data: `GET /api/submissions-with-workflow`

### Issue: Stages Not Updating

**Solution**:

1. Verify the stage `key` matches in the update request
2. Check that the history ID is correct
3. Ensure the stages array is properly formatted JSON

### Issue: Styling Issues

**Solution**:

1. Verify Tailwind is configured: check `tailwind.config.js`
2. Ensure `index.css` imports Tailwind directives
3. Restart dev server: `npm run dev`

---

## Future Enhancements

Potential improvements:

1. **Real-time Updates** - Use WebSocket for live stage updates
2. **Stage Comments** - Allow users to add comments at each stage
3. **File Attachments** - Attach documents to stages
4. **Stage Duration Analytics** - Track time spent in each stage
5. **Custom Stage Colors** - Allow workflow creators to define colors
6. **Email Notifications** - Send emails when stages change
7. **Mobile App** - Native mobile app for workflow tracking
8. **Export Reports** - Generate PDF reports of workflow history
9. **Bulk Operations** - Update multiple workflows at once
10. **Advanced Filtering** - Filter by status, date range, user, etc.

---

## Support

For issues or questions:

- Check the console for errors
- Review the API response in browser DevTools
- Verify database schema matches expected structure
- Test endpoints individually with curl/Postman

---

## Summary

The new workflow history system provides:

- ✅ Modern, clean UI with Tailwind CSS
- ✅ Visual stage tracking with timeline
- ✅ Complete backend API
- ✅ Database schema with migrations
- ✅ Expandable submission cards
- ✅ Real-time connection status
- ✅ Lucide React icons throughout
- ✅ Responsive design

The system is ready for production use with proper workflow definition integration!
