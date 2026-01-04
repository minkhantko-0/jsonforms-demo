# Workflow Builder - Bidirectional JSON Sync Implementation

## Summary

Successfully implemented a bidirectional workflow builder with JSON view synchronization. The builder now supports the new JSON structure format and allows seamless switching between visual builder and JSON editing.

## Key Features Implemented

### 1. **New JSON Structure Support** ✅

- Updated workflow types to match the new `workflowDefinitions` array structure
- Added support for `parallel_gateway` and `parallel_join` node types
- Added `branches`, `description`, `groups`, `slas`, and `timers` fields
- Updated transitions to support `branch` property

### 2. **Bidirectional Sync** ✅

- **Builder → JSON**: Automatically syncs visual changes to JSON view
- **JSON → Builder**: Click sync button to import JSON changes back to visual builder
- Real-time synchronization when switching tabs
- Validation and error handling for invalid JSON

### 3. **Enhanced Node Configuration** ✅

- **Task Nodes**: Now support:
  - Multiple roles (manager, senior_manager, ceo)
  - Multiple groups (operation, security, finance, hr)
  - Multiple SLAs (SLA01, SLA02, SLA03)
  - Multiple timers (Timer01, Timer02)
- **Service Nodes**: Support HTTP configuration with method, URL, and body
- **Parallel Gateway**: Support branches configuration
- **Parallel Join**: Support dependencies and conditions

### 4. **New UI Features** ✅

- **Tabs**: Switch between Builder and JSON View
- **Import JSON**: Upload JSON files to load workflows
- **Export JSON**: Download workflow as JSON file
- **Sync Button**: Manually sync JSON changes to builder (visible in JSON view)
- **Snackbar Notifications**: Success/error messages for operations

### 5. **New Node Types** ✅

Added buttons to create:

- Task nodes
- Decision nodes
- Service nodes
- **Parallel Gateway** (new)
- **Parallel Join** (new)
- End nodes

## How to Use

### Visual Builder Mode

1. Click "Builder" tab to use visual editor
2. Add nodes using the left panel buttons
3. Connect nodes by dragging from one node to another
4. Click edit icon on nodes/edges to configure
5. Enter workflow name and key, then click "Export JSON"

### JSON View Mode

1. Click "JSON View" tab to see/edit JSON
2. Edit JSON directly in the Monaco editor
3. Click the sync button (🔄) to apply changes to visual builder
4. JSON automatically updates when you make visual changes

### Import Existing Workflow

1. Click "Import JSON" button
2. Select a JSON file (like `sample-workflow.json`)
3. Workflow will be loaded into both visual and JSON views

### Configure Task Nodes

When editing a task node:

- Set roles (from available roles)
- Set groups (operation, security, finance, hr)
- Set SLAs (values come from SLA Setup - currently SLA01, SLA02, SLA03)
- Set timers (values come from Timer Setup - currently Timer01, Timer02)

### Configure Service Nodes

When editing a service node:

- Select HTTP method (GET, POST, PUT, DELETE, PATCH)
- Enter URL endpoint
- Enter request body as JSON

## SLA and Timer Integration

The workflow builder is designed to integrate with SLA and Timer setup:

```typescript
// In WorkFlowBuilder.tsx (lines 101-105)
const [availableSLAs] = useState<string[]>(['SLA01', 'SLA02', 'SLA03']);
const [availableTimers] = useState<string[]>(['Timer01', 'Timer02']);
```

**To integrate with actual SLA Setup:**

1. Import/fetch SLAs from SLA Setup component
2. Update `availableSLAs` state with actual SLA IDs
3. Pass to NodeConfigDialog for selection

## Files Modified

1. **src/types/workflow.ts**

   - Updated types to support new JSON structure
   - Added `ParallelBranch`, updated `WorkflowNode`, `NodeConfig`
   - Added `WorkflowDefinition` (new structure) and `OldWorkflowDefinition`

2. **src/components/WorkFlowBuilder.tsx**

   - Added Monaco editor for JSON view
   - Implemented bidirectional sync functions
   - Added import/export functionality
   - Added tabs for switching between Builder/JSON views
   - Updated to support new node types and configuration

3. **src/components/workflow/NodeConfigDialog.tsx**
   - Added fields for groups, SLAs, and timers
   - Updated configuration save logic
   - Added support for parallel gateway branches

## Sample Workflow

A sample workflow file is included: `sample-workflow.json`

This demonstrates:

- Parallel gateway with two branches
- Task nodes with roles, groups, and SLAs
- Decision nodes for approval/rejection logic
- Service nodes for notifications
- Parallel join with dependencies and conditions
- Multiple transitions with JEXL expressions

## Testing

To test the implementation:

1. **Import Sample Workflow**

   - Click "Import JSON" and select `sample-workflow.json`
   - Verify nodes appear in visual builder
   - Check JSON view matches the imported file

2. **Edit in Builder**

   - Add/remove nodes
   - Edit node configurations
   - Switch to JSON view and verify changes

3. **Edit in JSON**

   - Switch to JSON view
   - Modify the JSON
   - Click sync button
   - Verify changes appear in visual builder

4. **Export Workflow**
   - Enter workflow name and key
   - Click "Export JSON"
   - Verify downloaded JSON matches current state

## Dependencies

Install required package:

```bash
npm install @monaco-editor/react
```

## Future Enhancements

1. **SLA/Timer Integration**: Connect to actual SLA Setup component to fetch real SLA and timer values
2. **Validation**: Add JSON schema validation
3. **Auto-layout**: Implement automatic node positioning algorithm
4. **Undo/Redo**: Add history management
5. **Templates**: Save and load workflow templates
6. **Search**: Add node search functionality
7. **Zoom/Pan**: Enhanced navigation controls

## Notes

- The Monaco Editor provides syntax highlighting and validation for JSON
- Error messages appear as snackbar notifications
- The sync is designed to be safe - invalid JSON won't crash the builder
- TypeScript provides type safety for workflow definitions
