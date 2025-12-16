# Debugging: API Workflow Binding

## Steps to Verify API is Working

### 1. Make Sure Server is Running

```bash
cd server
npm run dev
```

You should see:

```
Server running on http://localhost:3001
```

### 2. Test API Directly in Browser

Open: http://localhost:3001/api/workflows

You should see JSON response:

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

### 3. Check Browser Console

1. Open your app in browser
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Refresh the page (F5)
5. Look for these logs:

```
✅ "Fetching workflows from API..."
✅ "Workflows fetched:" [array of workflows]
✅ "Enum values:" ["workflow-1", "workflow-2", ...]
✅ "Enum labels:" ["Standard Approval", "Manager Approval", ...]
✅ "Updating schema with workflows..."
```

### 4. Check Network Tab

1. In DevTools, go to **Network** tab
2. Refresh page (F5)
3. Look for request to `workflows`
4. Click on it
5. Check:
   - **Status**: Should be 200 OK
   - **Response**: Should show JSON array
   - **Headers**: Should have CORS headers

### 5. Check the Schema Editor

1. Look at the **JSON Schema** editor (left panel, top)
2. Find the `workflowId` property
3. It should have:

```json
"workflowId": {
  "type": "string",
  "title": "Workflow ID",
  "enum": ["workflow-1", "workflow-2", "workflow-3", "workflow-4", "workflow-5"],
  "enumNames": ["Standard Approval", "Manager Approval", ...]
}
```

### 6. Test the Dropdown

1. Enter amount: **100000** or higher
2. Workflow dropdown should appear
3. Click the dropdown
4. You should see 5 options:
   - Standard Approval
   - Manager Approval
   - Executive Approval
   - Board Approval
   - Emergency Approval

## Common Issues & Solutions

### Issue 1: Network Error / Fetch Failed

**Symptoms:**

- Console shows: "Failed to fetch workflow options"
- Red toast notification appears

**Solutions:**

1. Check server is running on port 3001
2. Check for CORS errors in console
3. Make sure URL is correct: `http://localhost:3001/api/workflows`

### Issue 2: Dropdown Shows Old Values

**Symptoms:**

- Dropdown only shows 4 workflows (not 5)
- Values don't match API response

**Solutions:**

1. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Check JSON Schema editor - values might be cached

### Issue 3: Dropdown Doesn't Appear

**Symptoms:**

- Entered amount >= 100000
- Workflow dropdown still hidden

**Solutions:**

1. Check amount is a number (not text)
2. Check UI Schema has correct rule:

```json
{
  "type": "Control",
  "scope": "#/properties/workflowId",
  "rule": {
    "effect": "SHOW",
    "condition": {
      "scope": "#/properties/amount",
      "schema": {
        "minimum": 100000
      }
    }
  }
}
```

### Issue 4: Schema Not Updating

**Symptoms:**

- API call succeeds
- Console logs show correct data
- But dropdown still shows old values

**Solutions:**

1. Check if `setSchema()` is being called
2. Check JsonForms `key` prop is changing
3. Try clicking "Format & Save Schema" button to force update

## Test Commands

### Test API with curl (Command Line)

```bash
curl http://localhost:3001/api/workflows
```

### Test with PowerShell

```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/workflows | Select-Object -Expand Content
```

## Expected Flow

```
1. Page loads
   ↓
2. useEffect runs
   ↓
3. Fetch http://localhost:3001/api/workflows
   ↓
4. Receive: [{id, name}, {id, name}, ...]
   ↓
5. Extract enum values and names
   ↓
6. Update schema with setSchema()
   ↓
7. Toast: "Loaded 5 workflows from API"
   ↓
8. Form re-renders with new schema
   ↓
9. Dropdown populated with API data
```

## Still Not Working?

### Check These:

1. **Console Errors?**

   - Any red errors in browser console?
   - Any CORS errors?

2. **Server Console Output?**

   - Any errors when API is called?
   - Is route handler being executed?

3. **Schema State?**

   - Use React DevTools
   - Check `useFormStore` state
   - Verify `schema.properties.workflowId.enum` has API values

4. **Component Re-render?**
   - JsonForms key should include schema
   - Key: `JSON.stringify(schema) + JSON.stringify(uiSchema)`
   - When schema changes, key changes, component re-renders

## Quick Verification Checklist

- [ ] Server running on port 3001
- [ ] API returns data: http://localhost:3001/api/workflows
- [ ] Browser console shows "Fetching workflows from API..."
- [ ] Browser console shows workflow data
- [ ] Toast shows "Loaded 5 workflows from API"
- [ ] JSON Schema editor shows 5 enum values
- [ ] Amount >= 100000 entered
- [ ] Dropdown appears and shows 5 options

If all checkboxes are checked, it's working! ✅
