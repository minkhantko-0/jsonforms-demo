# Workflow JSON Structure Reference

## Overview

This document describes the new workflow JSON structure that supports parallel workflows, branches, and enhanced node configurations.

## Root Structure

```json
{
  "workflowDefinitions": [
    {
      "name": "string",
      "key": "string",
      "nodes": [...],
      "transitions": [...]
    }
  ]
}
```

## Node Types

### 1. Start Node

```json
{
  "key": "start",
  "description": "Start Node",
  "type": "start"
}
```

### 2. Task Node (Assignment)

```json
{
  "key": "operation_manager_approval",
  "description": "Operation Manager Approval",
  "type": "task",
  "config": {
    "type": "assignment",
    "roles": ["manager", "senior_manager"],
    "groups": ["operation", "security"],
    "slas": ["SLA01", "SLA02"],
    "timers": ["Timer01"]
  }
}
```

**Fields:**

- `roles`: Array of role identifiers for assignment
- `groups`: Array of group identifiers for assignment
- `slas`: Array of SLA identifiers (from SLA Setup)
- `timers`: Array of timer identifiers (from Timer Setup)

### 3. Decision Node

```json
{
  "key": "manager_decision",
  "description": "Manager Decision",
  "type": "decision"
}
```

### 4. Service Node (HTTP)

```json
{
  "key": "send_notification",
  "description": "Send Notification",
  "type": "service",
  "config": {
    "type": "service",
    "payload": {
      "type": "http",
      "method": "POST",
      "url": "https://api.example.com/notifications",
      "body": {
        "title": "Approved",
        "message": "Request approved"
      }
    }
  }
}
```

**Supported HTTP Methods:**

- GET
- POST
- PUT
- DELETE
- PATCH

### 5. Parallel Gateway

```json
{
  "key": "first_gateway",
  "type": "parallel_gateway",
  "description": "Parallel Gateway Node",
  "branches": [
    {
      "key": "branch_1",
      "name": "Branch 1 Name",
      "nodes": ["node1", "node2"]
    },
    {
      "key": "branch_2",
      "name": "Branch 2 Name",
      "nodes": ["node3", "node4"]
    }
  ]
}
```

**Branches:**

- Each branch has a key, name, and array of node keys
- Nodes in branches execute in parallel

### 6. Parallel Join

```json
{
  "key": "gateway_join",
  "type": "parallel_join",
  "description": "Join Node",
  "config": {
    "dependencies": ["branch_1", "branch_2"],
    "condition": {
      "type": "jexl",
      "expression": "${context.variables.outputs.gateway.totalApproval} == 2"
    }
  }
}
```

**Fields:**

- `dependencies`: Array of branch keys that must complete
- `condition`: JEXL expression for join condition

### 7. End Node

```json
{
  "key": "end",
  "type": "end",
  "description": "End Node"
}
```

## Transitions

### Basic Transition

```json
{
  "fromNode": "start",
  "toNode": "first_task"
}
```

### Transition with Branch

```json
{
  "fromNode": "parallel_gateway",
  "toNode": "task_in_branch",
  "branch": "branch_1"
}
```

### Transition with Condition (JEXL)

```json
{
  "fromNode": "decision_node",
  "toNode": "approved_node",
  "config": {
    "type": "condition",
    "payload": {
      "type": "jexl",
      "expression": "${context.variables.outputs.approval.isApproved} == true"
    }
  }
}
```

**Alternative short form:**

```json
{
  "fromNode": "decision_node",
  "toNode": "rejected_node",
  "config": {
    "type": "condition",
    "expression": "${context.variables.outputs.approval.isApproved} == false"
  }
}
```

## JEXL Expressions

### Context Variables

Access workflow context:

```javascript
${context.variables.outputs.NODE_KEY.PROPERTY}
```

### Common Patterns

**Check approval status:**

```javascript
${context.variables.outputs.manager_approval.isApproved} == true
```

**Check rejection:**

```javascript
${context.variables.outputs.manager_approval.isApproved} == false
```

**Multiple conditions (AND):**

```javascript
${context.variables.outputs.approval1.isApproved} == true && ${context.variables.outputs.approval2.isApproved} == true
```

**Multiple conditions (OR):**

```javascript
${context.variables.outputs.approval1.isApproved} == true || ${context.variables.outputs.approval2.isApproved} == true
```

**Check total approvals:**

```javascript
${context.variables.outputs.gateway.totalApproval} >= 2
```

**Check amount:**

```javascript
${context.variables.amount} > 1000
```

## Complete Example

```json
{
  "workflowDefinitions": [
    {
      "name": "Simple Approval Workflow",
      "key": "simple_approval_v1",
      "nodes": [
        {
          "key": "start",
          "description": "Start",
          "type": "start"
        },
        {
          "key": "manager_approval",
          "description": "Manager Approval",
          "type": "task",
          "config": {
            "type": "assignment",
            "roles": ["manager"],
            "groups": ["operation"],
            "slas": ["SLA01"],
            "timers": []
          }
        },
        {
          "key": "decision",
          "description": "Decision Point",
          "type": "decision"
        },
        {
          "key": "send_approved",
          "description": "Send Approved Notification",
          "type": "service",
          "config": {
            "type": "service",
            "payload": {
              "type": "http",
              "method": "POST",
              "url": "https://api.example.com/notifications",
              "body": {
                "title": "Approved",
                "message": "Request approved by manager"
              }
            }
          }
        },
        {
          "key": "send_rejected",
          "description": "Send Rejected Notification",
          "type": "service",
          "config": {
            "type": "service",
            "payload": {
              "type": "http",
              "method": "POST",
              "url": "https://api.example.com/notifications",
              "body": {
                "title": "Rejected",
                "message": "Request rejected by manager"
              }
            }
          }
        },
        {
          "key": "end",
          "type": "end"
        }
      ],
      "transitions": [
        {
          "fromNode": "start",
          "toNode": "manager_approval"
        },
        {
          "fromNode": "manager_approval",
          "toNode": "decision"
        },
        {
          "fromNode": "decision",
          "toNode": "send_approved",
          "config": {
            "type": "condition",
            "payload": {
              "type": "jexl",
              "expression": "${context.variables.outputs.manager_approval.isApproved} == true"
            }
          }
        },
        {
          "fromNode": "decision",
          "toNode": "send_rejected",
          "config": {
            "type": "condition",
            "payload": {
              "type": "jexl",
              "expression": "${context.variables.outputs.manager_approval.isApproved} == false"
            }
          }
        },
        {
          "fromNode": "send_approved",
          "toNode": "end"
        },
        {
          "fromNode": "send_rejected",
          "toNode": "end"
        }
      ]
    }
  ]
}
```

## Best Practices

1. **Node Keys**: Use descriptive, unique keys (e.g., `operation_manager_approval`)
2. **Descriptions**: Add human-readable descriptions for all nodes
3. **SLAs/Timers**: Reference valid IDs from SLA/Timer Setup
4. **JEXL Expressions**: Keep expressions simple and readable
5. **Transitions**: Ensure all nodes are reachable from start
6. **End Node**: All paths should eventually reach an end node
7. **Parallel Branches**: Ensure branch keys match in gateway and transitions
8. **Dependencies**: List all required branches in parallel join dependencies

## Validation Rules

- ✅ All node keys must be unique
- ✅ Start node is required
- ✅ End node is recommended
- ✅ All transition fromNode/toNode must reference existing nodes
- ✅ Branch names in transitions must match branch keys in parallel gateway
- ✅ JEXL expressions must be valid syntax
- ✅ Service payload URLs must be valid
- ✅ HTTP methods must be one of: GET, POST, PUT, DELETE, PATCH

## Migration from Old Structure

**Old Structure:**

```json
{
  "roles": [...],
  "users": [...],
  "workflows": [...]
}
```

**New Structure:**

```json
{
  "workflowDefinitions": [...]
}
```

Changes:

- Removed top-level `roles` and `users` (managed elsewhere)
- Renamed `workflows` to `workflowDefinitions`
- Node config structure changed from nested `payload` to direct properties
- Added support for `description`, `groups`, `slas`, `timers`
