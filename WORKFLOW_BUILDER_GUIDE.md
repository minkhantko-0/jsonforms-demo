# Workflow Builder Implementation

## Overview

The Workflow Builder is a visual tool built with React Flow that allows you to create workflow definitions in JSON format. It supports creating complex approval workflows with multiple nodes and conditional transitions.

## Features

### Node Types

1. **Start Node** - Entry point of the workflow (automatically included)
2. **Task Node** - Represents an assignment/approval task with role-based assignment
3. **Decision Node** - Branching point for conditional logic
4. **Service Node** - HTTP service call (notifications, processing, etc.)
5. **End Node** - Termination point of the workflow

### Key Capabilities

- ✅ Drag-and-drop visual workflow design
- ✅ Node configuration with roles and service endpoints
- ✅ Conditional transitions using JEXL expressions
- ✅ Export to JSON workflow definition
- ✅ Full TypeScript support
- ✅ Material-UI integration

## Usage

### 1. Adding Nodes

Click the buttons in the left panel to add nodes:

- **Task** - For approval/assignment steps
- **Decision** - For branching logic
- **Service** - For HTTP calls (notifications, processing)
- **End** - To terminate the workflow

### 2. Configuring Nodes

Click the **Edit** icon on any node to configure:

**Task Node Configuration:**

- Node Label (display name)
- Node Key (unique identifier)
- Configuration Type: Assignment
- Roles: Select one or more roles (manager, senior_manager, ceo)

**Service Node Configuration:**

- Node Label
- Node Key
- Configuration Type: Service (HTTP)
- HTTP Method (GET, POST, PUT, DELETE, PATCH)
- URL endpoint
- Request Body (JSON format)

**Decision/Start/End Nodes:**

- Node Label
- Node Key
- No additional configuration needed

### 3. Creating Transitions

- **Drag** from the bottom handle of a node
- **Drop** on the top handle of another node
- This creates a transition/edge between nodes

### 4. Configuring Transitions

Click the **Edit** icon on any edge to add conditions:

**JEXL Expression Examples:**

```javascript
// Approval condition
variables.outputs.first_approval.isApproved == true;

// Rejection condition
variables.outputs.first_approval.isApproved == false;

// Complex condition
variables.outputs.second_approval.isApproved == true && variables.amount > 1000;
```

### 5. Exporting Workflow

1. Enter a **Workflow Name** (e.g., "CSV Upload Workflow (Manager)")
2. Enter a **Workflow Key** (e.g., "csv_upload_v1")
3. Click **Export JSON**
4. The workflow definition will be downloaded as a JSON file

## Example Workflows

### Simple Approval Flow

```
Start → Task (Manager) → Decision → Service (Notification) → End
                          ↓
                    Service (Rejection) → End
```

### Multi-Level Approval Flow

```
Start → Task (Manager) → Decision → Task (Senior Manager) → Decision → Service (Approved) → End
                          ↓                                    ↓
                    Service (Rejected) ←──────────────────────┘
                          ↓
                         End
```

## JSON Output Structure

The exported JSON includes:

- **roles**: Array of role definitions
- **users**: Array of user definitions with role assignments
- **workflows**: Array containing your workflow definition
  - **key**: Unique workflow identifier
  - **name**: Human-readable workflow name
  - **nodes**: Array of workflow nodes with configurations
  - **transitions**: Array of edges with optional conditions

## Technical Details

### Components

- **WorkFlowBuilder.tsx**: Main workflow builder component
- **CustomNode.tsx**: Custom node renderer for all node types
- **CustomEdge.tsx**: Custom edge renderer with condition labels
- **NodeConfigDialog.tsx**: Node configuration modal
- **EdgeConfigDialog.tsx**: Edge/transition configuration modal

### Type Definitions

See `src/types/workflow.ts` for complete TypeScript definitions:

- `WorkflowNode`, `WorkflowTransition`
- `NodeConfig`, `AssignmentPayload`, `ServicePayload`
- `WorkflowDefinition`

### Dependencies

- `@xyflow/react`: React Flow library for visual workflow design
- `@mui/material`: Material-UI components
- `@mui/icons-material`: Material-UI icons

## Tips

- **Start** with a Start node (automatically included)
- **Always** connect to an End node
- **Use Decision nodes** after Task nodes for approval/rejection branching
- **Configure conditions** on edges leaving Decision nodes
- **Unique node keys** are required for JEXL expressions to work
- **Test JEXL expressions** carefully - they reference `variables.outputs.NODE_KEY`

## Common Patterns

### Approval with Notification

```
Task → Decision → (if approved) → Service (Approved Notification)
                → (if rejected) → Service (Rejected Notification)
```

### Sequential Approvals

```
Task 1 → Decision 1 → (if approved) → Task 2 → Decision 2 → ...
                    → (if rejected) → Service (Notification) → End
```

### Service Chain

```
Service 1 (Validate) → Service 2 (Process) → Service 3 (Notify) → End
```
