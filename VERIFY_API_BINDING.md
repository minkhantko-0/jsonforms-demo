# Verifying API Binding to Workflow Dropdown

## The Problem

You're seeing the workflow dropdown binding to JSON schema values instead of API data.

## What We've Set Up

### 1. Clean Initial Schema ✅

**File**: `src/data/schema.json`

```json
"workflowId": {
  "type": "string",
  "title": "Workflow ID"
}
```

- ✅ No `enum` property
- ✅ No `enumNames` property
- ✅ Just a basic string field

### 2. API Endpoint ✅

**Endpoint**: `http://localhost:3001/api/workflows`
**Returns**:

```json
[
  { "id": "workflow-1", "name": "Standard Approval", "description": "..." },
  { "id": "workflow-2", "name": "Express Processing", "description": "..." },
  { "id": "workflow-3", "name": "Emergency Override", "description": "..." },
  { "id": "workflow-4", "name": "Executive Review", "description": "..." },
  { "id": "workflow-5", "name": "Compliance Check", "description": "..." }
]
```

### 3. Frontend Logic ✅

**File**: `src/components/JsonFormsDemo.tsx`

The `useEffect` hook:

1. Fetches workflows from API on component mount
2. Extracts `id` → `enum` values
3. Extracts `name` → `enumNames` labels
4. Updates schema with these values
5. Calls `setSchema(updatedSchema)` to update store

### 4. Enhanced Logging ✅

We've added comprehensive console logging with emoji markers:

- 🔹 Initial schema state
- ✅ API response
- 📋 Extracted enum values
- 🔄 Updated schema
- 🔍 workflowId property inspection
- 🎨 Render-time schema check

## How to Verify

### Step 1: Start the Backend Server

```powershell
cd d:\psp\sample_projects\jsonforms-demo\server
npm run dev
```

**Expected output**: Server running on http://localhost:3001

### Step 2: Test API Directly

Open browser and visit: http://localhost:3001/api/workflows

**Expected**: You should see JSON array with 5 workflows

### Step 3: Start Frontend

```powershell
cd d:\psp\sample_projects\jsonforms-demo
npm run dev
```

### Step 4: Hard Refresh Browser

1. Open http://localhost:5173
2. Press **Ctrl + Shift + R** (hard refresh to clear cache)
3. Open DevTools: **F12**
4. Go to **Console** tab

### Step 5: Check Console Output

Look for this sequence:

```
🔹 Initial schema before mount: {type: "object", properties: {...}}
🔹 workflowId property before mount: {type: "string", title: "Workflow ID"}
=== FETCHING WORKFLOWS FROM API ===
Current schema before API: {type: "object", properties: {...}}
✅ API Response - Workflows fetched: (5) [{...}, {...}, ...]
📋 Extracted enum values: (5) ['workflow-1', 'workflow-2', 'workflow-3', 'workflow-4', 'workflow-5']
📋 Extracted enumNames labels: (5) ['Standard Approval', 'Express Processing', 'Emergency Override', 'Executive Review', 'Compliance Check']
🔄 Updated schema with API data: {type: "object", properties: {...}}
🔍 workflowId property: {type: "string", title: "Workflow ID", enum: Array(5), enumNames: Array(5)}
✅ Schema updated in store
🎨 Rendering JsonForms with schema: {type: "object", properties: {...}}
🎨 workflowId in render: {type: "string", title: "Workflow ID", enum: Array(5), enumNames: Array(5)}
```

### Step 6: Expand Console Objects

1. Click the arrows next to each logged object
2. Verify `workflowId property` contains:
   - `enum: ['workflow-1', 'workflow-2', 'workflow-3', 'workflow-4', 'workflow-5']`
   - `enumNames: ['Standard Approval', 'Express Processing', 'Emergency Override', 'Compliance Check', 'Executive Review']`

### Step 7: Check the Dropdown

1. In the form, enter **100000** or more in the Amount field
2. The "Workflow ID" dropdown should appear
3. Click the dropdown
4. **Expected**: You should see 5 options:
   - Standard Approval
   - Express Processing
   - Emergency Override
   - Executive Review
   - Compliance Check

## If It Still Doesn't Work

### Scenario 1: No Console Logs Appear

**Problem**: useEffect not running
**Solution**: Check if component is mounting. Add breakpoint in useEffect.

### Scenario 2: Console Shows "❌ Error fetching workflows"

**Problem**: API not responding
**Solution**:

- Check backend server is running
- Verify URL: http://localhost:3001/api/workflows
- Check CORS settings in server

### Scenario 3: Console Shows API Data But Dropdown Empty

**Problem**: Schema update not triggering re-render
**Solution**: Check if `key` prop on JsonForms is changing

### Scenario 4: Dropdown Shows Old/Different Values

**Problem**: Browser cache or React state not updating
**Solutions**:

1. Hard refresh: **Ctrl + Shift + R**
2. Clear browser cache completely
3. Check if store is updating: Add console.log in formStore.ts

### Scenario 5: "🎨 Rendering" Logs Show No Enum

**Problem**: Timing issue - component rendering before API completes
**Solution**: The component should re-render after setSchema. Check:

```javascript
// Should trigger re-render because schema object reference changes
setSchema(updatedSchema);
```

## What the Logs Tell Us

| Log Message                      | What It Means                                           |
| -------------------------------- | ------------------------------------------------------- |
| `🔹 Initial schema before mount` | Schema when component first loads - should have NO enum |
| `=== FETCHING WORKFLOWS`         | API call starting                                       |
| `✅ API Response`                | API returned data successfully                          |
| `📋 Extracted enum values`       | Successfully mapped workflow IDs                        |
| `🔄 Updated schema`              | New schema object created with enum/enumNames           |
| `🔍 workflowId property`         | The specific field that should have enum array          |
| `✅ Schema updated in store`     | Store's setSchema was called                            |
| `🎨 Rendering JsonForms`         | Component rendering - schema should have enum now       |

## Expected Flow

```
1. Component Mounts
   └─> Initial schema loaded (no enum)
       └─> "🔹 Initial schema before mount"

2. useEffect Runs
   └─> Fetch API
       └─> "=== FETCHING WORKFLOWS FROM API ==="
       └─> "✅ API Response"
       └─> Extract enum values
           └─> "📋 Extracted enum values"
       └─> Update schema
           └─> "🔄 Updated schema"
       └─> setSchema(updatedSchema)
           └─> "✅ Schema updated in store"

3. Component Re-renders (because schema changed)
   └─> "🎨 Rendering JsonForms with schema"
   └─> JsonForms gets new schema with enum
       └─> Dropdown populates with API data
```

## Debug Checklist

- [ ] Backend server running on port 3001
- [ ] API endpoint returns 5 workflows at http://localhost:3001/api/workflows
- [ ] Frontend dev server running
- [ ] Browser hard refreshed (Ctrl+Shift+R)
- [ ] Console shows "=== FETCHING WORKFLOWS FROM API ==="
- [ ] Console shows "✅ API Response"
- [ ] Console shows enum array with 5 workflow IDs
- [ ] Console shows "🎨 Rendering" with schema containing enum
- [ ] Amount field set to ≥ 100000
- [ ] Workflow dropdown visible
- [ ] Dropdown contains 5 workflow options

## Share This Info

When reporting the issue, please provide:

1. **Console Output**: Copy/paste the entire console output or screenshot
2. **Network Tab**: Check if API call is made (F12 → Network → XHR)
3. **Dropdown Content**: What values do you actually see in the dropdown?
4. **Schema Editor**: What does the JSON Schema editor show for workflowId?

This will help identify exactly where the binding breaks!
