# Simple Workflow Approval Example

## Overview

This example demonstrates a simple conditional form with 3 fields:

1. **Amount** - A number input field
2. **Workflow ID** - A dropdown that appears only when amount > 10,000
3. **File Picker** - A file upload field

## How It Works

```
┌─────────────────────────────────────────┐
│ Amount: [_______]                       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Workflow ID: [Select ▼]            │ │ ← Hidden when amount ≤ 10,000
│ │ - Standard Approval                │ │   Shows when amount > 10,000
│ │ - Manager Approval                 │ │
│ │ - Executive Approval               │ │
│ │ - Board Approval                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Upload Document: [Choose File]          │
└─────────────────────────────────────────┘
```

## Test Scenarios

### Scenario 1: Amount ≤ 10,000

```
Amount: 5000
→ Workflow ID dropdown is HIDDEN
→ Only Amount and File Picker are visible
```

### Scenario 2: Amount > 10,000

```
Amount: 15000
→ Workflow ID dropdown APPEARS
→ User can select approval workflow
```

## Rule Explanation

**UI Schema Rule:**

```json
{
  "type": "Control",
  "scope": "#/properties/workflowId",
  "rule": {
    "effect": "SHOW",
    "condition": {
      "scope": "#/properties/amount",
      "schema": {
        "minimum": 10000
      }
    }
  }
}
```

**Translation:**

- **Field:** Workflow ID dropdown
- **Effect:** SHOW (hidden by default, shows when condition is true)
- **Condition:** When amount field has a value >= 10000
- **Result:** Dropdown appears for high-value transactions requiring approval

## Business Logic

This pattern is common in approval workflows:

- Small transactions (< $10,000) → No special approval needed
- Large transactions (≥ $10,000) → Requires workflow approval selection

## Try It Now

1. **Refresh the page** (F5) to load the new schema
2. **Enter amount < 10000** (e.g., 5000)
   - Notice: Only Amount and File Picker are visible
3. **Enter amount = 10000**
   - Workflow ID dropdown appears!
4. **Enter amount > 10000** (e.g., 25000)
   - Workflow ID dropdown is still visible
5. **Select a workflow** from the dropdown
6. **Upload a file** using the file picker
7. **Check the Bound Data panel** on the right to see your values

## Customization

Want to change the threshold? Edit the UI Schema:

```json
"schema": {
  "minimum": 5000  // Change to any value
}
```

Want to add more workflows? Edit the JSON Schema:

```json
"enum": ["workflow-1", "workflow-2", "workflow-3", "workflow-4", "workflow-5"],
"enumNames": ["Standard", "Manager", "Executive", "Board", "Custom"]
```

## Next Steps

You can extend this example:

- Add more conditional fields
- Use AND/OR conditions for complex logic
- Add validation rules
- Customize the dropdown options
- Add more file upload fields

See `CONDITIONAL_FIELDS_GUIDE.md` for more examples!
