# Dynamic Dropdown from API

This guide explains how to populate the Workflow ID dropdown with data from an API.

## How It Works

1. **Frontend** fetches workflow data from API on component mount
2. **Backend** API returns list of workflows
3. **Schema** is dynamically updated with the fetched data
4. **Dropdown** is populated with API values

## Architecture

```
┌─────────────┐       GET /api/workflows      ┌─────────────┐
│             │ ──────────────────────────────>│             │
│  Frontend   │                                │   Backend   │
│  Component  │<───────────────────────────────│   API       │
│             │   [{id, name}, {id, name}...]  │             │
└─────────────┘                                └─────────────┘
       │
       │ Updates schema with fetched data
       ▼
┌─────────────┐
│   Schema    │
│   Updated   │
│   with API  │
│   Values    │
└─────────────┘
       │
       ▼
┌─────────────┐
│  Dropdown   │
│  Rendered   │
│  with Data  │
└─────────────┘
```

## Backend API Endpoint

**File:** `server/src/routes/workflows.ts`

```typescript
import { Context } from 'hono';

const workflows = [
  { id: 'workflow-1', name: 'Standard Approval' },
  { id: 'workflow-2', name: 'Manager Approval' },
  { id: 'workflow-3', name: 'Executive Approval' },
  { id: 'workflow-4', name: 'Board Approval' },
  { id: 'workflow-5', name: 'Emergency Approval' },
];

export const getWorkflowsHandler = async (c: Context) => {
  return c.json(workflows);
};
```

**Endpoint:** `GET http://localhost:3001/api/workflows`

**Response:**

```json
[
  { "id": "workflow-1", "name": "Standard Approval", "description": "..." },
  { "id": "workflow-2", "name": "Manager Approval", "description": "..." },
  ...
]
```

## Frontend Integration

**File:** `src/components/JsonFormsDemo.tsx`

```typescript
// State to hold workflow options
const [workflowOptions, setWorkflowOptions] = useState<{
  enum: string[];
  enumNames: string[];
}>({
  enum: [],
  enumNames: [],
});

// Fetch workflows on component mount
useEffect(() => {
  const fetchWorkflowOptions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/workflows');
      const workflows = await response.json();

      // Extract IDs and names
      const enumValues = workflows.map((w: any) => w.id);
      const enumLabels = workflows.map((w: any) => w.name);

      setWorkflowOptions({ enum: enumValues, enumNames: enumLabels });

      // Update schema dynamically
      const updatedSchema = {
        ...schema,
        properties: {
          ...schema.properties,
          workflowId: {
            ...schema.properties.workflowId,
            enum: enumValues,
            enumNames: enumLabels,
          },
        },
      };

      setSchema(updatedSchema);
      setJsonInput(JSON.stringify(updatedSchema, null, 2));
    } catch (error) {
      console.error('Failed to fetch workflow options:', error);
    }
  };

  fetchWorkflowOptions();
}, []);
```

## Testing the API

### 1. Test the Backend API

Open your browser or use curl:

```bash
curl http://localhost:3001/api/workflows
```

Expected response:

```json
[
  {
    "id": "workflow-1",
    "name": "Standard Approval",
    "description": "Regular approval process"
  },
  ...
]
```

### 2. Verify Frontend Integration

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for request to `/api/workflows`
5. Check the response data

### 3. Check the Dropdown

1. Enter amount >= 100,000
2. Workflow dropdown appears
3. Click dropdown to see options loaded from API
4. Options should match what the API returned

## Customizing the API Response

### Option 1: Database Integration

Replace mock data with database query:

```typescript
import { db } from '../db';
import { workflows } from '../db/schema';

export const getWorkflowsHandler = async (c: Context) => {
  const workflowList = await db.select().from(workflows);
  return c.json(workflowList);
};
```

### Option 2: Filter by Role/Permission

```typescript
export const getWorkflowsHandler = async (c: Context) => {
  const userRole = c.req.header('X-User-Role') || 'user';

  // Filter workflows based on user role
  const filteredWorkflows = workflows.filter(w => {
    if (userRole === 'admin') return true;
    if (userRole === 'manager') return w.id !== 'workflow-4'; // No board approval
    return w.id === 'workflow-1'; // Only standard
  });

  return c.json(filteredWorkflows);
};
```

### Option 3: Dynamic Based on Amount

Add query parameter for amount-based filtering:

```typescript
export const getWorkflowsHandler = async (c: Context) => {
  const amount = Number(c.req.query('amount') || 0);

  let availableWorkflows = workflows;

  if (amount >= 1000000) {
    // Only board approval for amounts >= 1M
    availableWorkflows = workflows.filter(w => w.id === 'workflow-4');
  } else if (amount >= 500000) {
    // Executive or board for >= 500K
    availableWorkflows = workflows.filter(w =>
      ['workflow-3', 'workflow-4'].includes(w.id),
    );
  } else if (amount >= 100000) {
    // Manager, executive, or board for >= 100K
    availableWorkflows = workflows.filter(w =>
      ['workflow-2', 'workflow-3', 'workflow-4'].includes(w.id),
    );
  } else {
    // Standard for < 100K
    availableWorkflows = workflows.filter(w => w.id === 'workflow-1');
  }

  return c.json(availableWorkflows);
};
```

Then update frontend to pass amount:

```typescript
const fetchWorkflowOptions = async (amount: number) => {
  const response = await fetch(
    `http://localhost:3001/api/workflows?amount=${amount}`,
  );
  // ... rest of code
};
```

## Handling Loading States

Add loading indicator while fetching:

```typescript
const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);

useEffect(() => {
  const fetchWorkflowOptions = async () => {
    setIsLoadingWorkflows(true);
    try {
      // ... fetch code
    } catch (error) {
      // ... error handling
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  fetchWorkflowOptions();
}, []);
```

Show loading state in UI:

```tsx
{
  isLoadingWorkflows && <CircularProgress />;
}
```

## Error Handling

### Backend Error Handling

```typescript
export const getWorkflowsHandler = async (c: Context) => {
  try {
    const workflows = await fetchWorkflowsFromDatabase();

    if (!workflows || workflows.length === 0) {
      return c.json({ error: 'No workflows available' }, 404);
    }

    return c.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
```

### Frontend Error Handling

```typescript
try {
  const response = await fetch('http://localhost:3001/api/workflows');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const workflows = await response.json();

  if (!Array.isArray(workflows) || workflows.length === 0) {
    throw new Error('Invalid or empty workflow data');
  }

  // ... process workflows
} catch (error) {
  console.error('Failed to fetch workflow options:', error);
  enqueueSnackbar('Failed to load workflows. Using default options.', {
    variant: 'warning',
  });

  // Fallback to default options
  setWorkflowOptions({
    enum: ['workflow-1'],
    enumNames: ['Standard Approval'],
  });
}
```

## Caching API Response

Use React Query for better caching:

```typescript
import { useQuery } from '@tanstack/react-query';

const {
  data: workflows,
  isLoading,
  error,
} = useQuery({
  queryKey: ['workflows'],
  queryFn: async () => {
    const response = await fetch('http://localhost:3001/api/workflows');
    return response.json();
  },
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
});

useEffect(() => {
  if (workflows) {
    // Update schema with workflow data
  }
}, [workflows]);
```

## Summary

✅ **Backend API** created at `/api/workflows`  
✅ **Frontend** fetches data on mount  
✅ **Schema** updates dynamically with API data  
✅ **Dropdown** shows API values  
✅ **Error handling** implemented  
✅ **Extensible** - easy to add database, filters, caching

The dropdown now loads real data from your backend API instead of hardcoded values!
