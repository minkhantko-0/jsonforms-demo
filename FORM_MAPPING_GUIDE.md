# Form Mapping Feature

This feature allows you to create and manage mappings between JSON form schemas and workflow IDs. The form mappings can be retrieved by other applications to dynamically render forms with their associated workflows.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete form mappings
- **JSON Form Upload**: Upload form schema and UI schema as JSON files
- **Workflow Integration**: Associate forms with workflow IDs from the workflow API
- **Dynamic Form Rendering**: External apps can fetch form mappings to render forms

## API Endpoints

### Get All Form Mappings

```http
GET /api/form-mappings
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Employee Onboarding Form",
      "formSchema": {...},
      "uiSchema": {...},
      "workflowId": "workflow-1",
      "description": "Form for new employee onboarding",
      "createdAt": "2026-01-14T10:00:00Z",
      "updatedAt": "2026-01-14T10:00:00Z"
    }
  ]
}
```

### Get Form Mapping by ID

```http
GET /api/form-mappings/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Employee Onboarding Form",
    "formSchema": {...},
    "uiSchema": {...},
    "workflowId": "workflow-1",
    "description": "Form for new employee onboarding",
    "createdAt": "2026-01-14T10:00:00Z",
    "updatedAt": "2026-01-14T10:00:00Z"
  }
}
```

### Create Form Mapping

```http
POST /api/form-mappings
Content-Type: application/json

{
  "name": "Employee Onboarding Form",
  "formSchema": {
    "type": "object",
    "properties": {
      "firstName": {
        "type": "string"
      },
      "lastName": {
        "type": "string"
      }
    }
  },
  "uiSchema": {
    "type": "VerticalLayout",
    "elements": [...]
  },
  "workflowId": "workflow-1",
  "description": "Form for new employee onboarding"
}
```

**Response:**

```json
{
  "success": true,
  "id": 1,
  "message": "Form mapping created successfully"
}
```

### Update Form Mapping

```http
PUT /api/form-mappings/:id
Content-Type: application/json

{
  "name": "Updated Form Name",
  "formSchema": {...},
  "uiSchema": {...},
  "workflowId": "workflow-2",
  "description": "Updated description"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Form mapping updated successfully"
}
```

### Delete Form Mapping

```http
DELETE /api/form-mappings/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Form mapping deleted successfully"
}
```

## UI Usage

1. Navigate to **"Form Mapping"** from the sidebar menu (under Submit Form)
2. Click **"Create New Mapping"** button
3. Fill in the form details:
   - **Name**: A descriptive name for the form mapping
   - **Description**: Optional description
   - **Workflow**: Select from available workflows
   - **Form Schema**: Upload a JSON file or paste JSON directly
   - **UI Schema**: (Optional) Upload or paste UI schema JSON
4. Click **"Create"** to save the mapping

### Editing a Mapping

- Click the **Edit** icon next to any form mapping
- Modify the fields as needed
- Click **"Update"** to save changes

### Deleting a Mapping

- Click the **Delete** icon next to any form mapping
- Confirm the deletion

## Database Schema

```sql
CREATE TABLE form_mappings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  form_schema JSON NOT NULL,
  ui_schema JSON,
  workflow_id VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Integration with External Apps

External applications can fetch form mappings and render them dynamically:

```javascript
// Fetch all form mappings
const response = await fetch('http://localhost:3001/api/form-mappings');
const { data } = await response.json();

// Fetch specific mapping
const mappingResponse = await fetch(
  'http://localhost:3001/api/form-mappings/1',
);
const { data: mapping } = await mappingResponse.json();

// Use the form schema with JSONForms or another form renderer
const { formSchema, uiSchema, workflowId } = mapping;
```

## Files Modified/Created

### Server

- `server/src/db/schema.ts` - Added `formMappings` table definition
- `server/src/routes/formMappings.ts` - Created CRUD API handlers
- `server/src/index.ts` - Registered form mapping routes
- `server/drizzle/0003_add_form_mappings_table.sql` - Migration file

### Client

- `src/components/FormMapping.tsx` - Created Form Mapping UI component
- `src/App.tsx` - Added Form Mapping to navigation menu

## Setup Instructions

1. **Run Database Migration**:

   ```bash
   cd server
   npm run db:push
   ```

2. **Start the Server**:

   ```bash
   cd server
   npm run dev
   ```

3. **Start the Client**:

   ```bash
   npm run dev
   ```

4. Navigate to the app and access **Form Mapping** from the sidebar

## Example Form Schema

Here's an example form schema you can use for testing:

```json
{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "minLength": 3
    },
    "lastName": {
      "type": "string",
      "minLength": 3
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "department": {
      "type": "string",
      "enum": ["HR", "Engineering", "Sales", "Marketing"]
    }
  },
  "required": ["firstName", "lastName", "email"]
}
```

## Example UI Schema

```json
{
  "type": "VerticalLayout",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/firstName"
    },
    {
      "type": "Control",
      "scope": "#/properties/lastName"
    },
    {
      "type": "Control",
      "scope": "#/properties/email"
    },
    {
      "type": "Control",
      "scope": "#/properties/department"
    }
  ]
}
```
