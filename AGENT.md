# Agent Context - JSON Forms Dynamic Form Builder

## Project Overview
A full-stack dynamic form builder that generates forms from JSON schemas with real-time validation, custom renderers, file uploads, and data persistence.

## Architecture

### Frontend (React + TypeScript + Vite)
- **Port**: 3000
- **Main Component**: `src/components/JsonFormsDemo.tsx`
- **Layout**: 3-column layout (JSON Schema input | Rendered Form | Bound Data)
- **State Management**: React Query (TanStack Query)
- **UI Library**: Material-UI v7
- **Form Library**: JSON Forms with custom renderers

### Backend (Hono + Node.js)
- **Port**: 3001
- **Framework**: Hono (lightweight API framework)
- **Database**: MySQL 8.0 (Docker container)
- **ORM**: Drizzle ORM
- **File Storage**: UploadThing
- **Validation**: Zod (generated from JSON Schema)

### Database
- **Type**: MySQL 8.0
- **Port**: 3306
- **Database Name**: formdata
- **Table**: submissions (id, data JSON, formSchema JSON, createdAt)

## Key Features

### 1. Dynamic Form Generation
- Edit JSON Schema in left panel
- Click "Format & Save" to update form
- Form renders in middle panel with Material-UI components
- Bound data displays in right panel

### 2. Custom Renderers
Three custom renderers registered in `JsonFormsDemo.tsx`:

**Rating Control** (`src/components/RatingControl.tsx`)
- Matches fields ending with "rating"
- Renders as star rating component (1-5 stars)
- Tester: `src/ratingControlTester.ts`

**Age Slider Control** (`src/components/AgeSliderControl.tsx`)
- Matches fields ending with "age"
- Renders as slider with min/max from schema
- Tester: `src/ageSliderControlTester.ts`

**File Upload Control** (`src/components/FileUploadControl.tsx`)
- Matches fields with `format: "data-url"`
- Stores File object in form data
- Displays selected filename or uploaded URL
- Tester: `src/fileUploadControlTester.ts`

### 3. Validation System
- **Client-side**: AJV with ajv-errors for custom error messages
- **Server-side**: Zod schema generated from JSON Schema
- Custom error messages defined in schema using `errorMessage` property
- File objects excluded from validation (validated after upload)

### 4. Form Submission Flow
1. User fills form and clicks Submit
2. Frontend validates data (excluding File objects)
3. If files present: sends FormData, else: sends JSON
4. Backend receives data:
   - Extracts files from FormData
   - Uploads files to UploadThing using Hono's `env(c)` for token
   - Replaces File objects with URLs in data
   - Validates with Zod
   - Stores in pendingSubmissions Map
   - Returns sessionId
5. Frontend connects to SSE endpoint
6. After 15 seconds, backend saves to MySQL
7. SSE completes, frontend shows notification and refreshes submissions

### 5. File Upload System
**Frontend**:
- FileUploadControl stores File object in form data
- JsonFormsDemo detects files and sends FormData
- Bound data displays `[File: filename.ext]` for File objects

**Backend**:
- Receives FormData with files
- Uses Hono's `env(c)` to get UPLOADTHING_TOKEN
- Creates UTApi instance per request
- Uploads files to UploadThing
- Replaces file fields with URLs
- Saves final data with URLs to database

### 6. View Submissions
- Component: `src/components/ViewSubmissions.tsx`
- Displays all submissions in expandable table
- Shows ID and timestamp by default
- Click to expand and view full data + schema
- Uses React Query for data fetching

## File Structure

```
demo-json-forms/
├── src/
│   ├── components/
│   │   ├── JsonFormsDemo.tsx          # Main form (3-column layout)
│   │   ├── ViewSubmissions.tsx        # Submissions table
│   │   ├── RatingControl.tsx          # Star rating renderer
│   │   ├── AgeSliderControl.tsx       # Age slider renderer
│   │   └── FileUploadControl.tsx      # File upload renderer
│   ├── ratingControlTester.ts         # Tester for rating fields
│   ├── ageSliderControlTester.ts      # Tester for age fields
│   ├── fileUploadControlTester.ts     # Tester for file fields
│   ├── schema.json                    # Default JSON schema
│   ├── App.tsx                        # Root with navigation
│   └── main.tsx                       # Entry point
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts              # Drizzle schema
│   │   │   └── index.ts               # DB connection
│   │   └── index.ts                   # Hono API server
│   ├── .env                           # UPLOADTHING_TOKEN
│   ├── docker-compose.yml             # MySQL container
│   └── drizzle.config.ts              # Drizzle config
└── README.md                          # User documentation
```

## API Endpoints

### POST /api/submit
- Accepts: JSON or FormData
- Validates data with Zod
- Uploads files to UploadThing
- Returns: `{ success: true, sessionId: string }`

### GET /api/submissions
- Returns all submissions from database
- Format: `{ success: true, data: [...] }`

### GET /api/events/:sessionId
- Server-Sent Events endpoint
- Waits 15 seconds
- Saves pending submission to database
- Sends completion event

## Environment Variables

### Server (.env)
```
UPLOADTHING_TOKEN=<your-token-here>
```

## Key Technical Decisions

### 1. Custom Renderer Pattern
- Create component with props interface
- Wrap with `withJsonFormsControlProps`
- Create tester function with `rankWith`
- Register in renderers array

### 2. File Upload Architecture
- Frontend: Store File objects in form data
- Backend: Handle upload and URL replacement
- Reason: Centralized upload logic, better error handling

### 3. Validation Strategy
- Client: AJV for immediate feedback
- Server: Zod for security
- File fields excluded from client validation

### 4. SSE for Async Processing
- Simulates long-running backend process
- Allows immediate user feedback
- Database save happens after delay

### 5. Hono env() for Environment Variables
- Uses `env(c)` from 'hono/adapter'
- Works across different runtimes
- Accesses process.env in Node.js

## Common Issues & Solutions

### Issue: File shows as `{}` in bound data
**Solution**: Custom JSON.stringify replacer to show `[File: name]`

### Issue: File not uploaded to UploadThing
**Solution**: 
1. Check .env file format (no quotes, no duplication)
2. Use `env(c)` to access token in request context
3. Create UTApi instance per request

### Issue: Validation errors on file fields
**Solution**: Filter out File objects before validation

### Issue: UPLOADTHING_TOKEN not found
**Solution**: Use Hono's `env(c)` instead of `process.env`

## Development Commands

### Start Everything
```bash
npm run dev:full  # Starts DB, server, and frontend
```

### Individual Services
```bash
# Database
cd server && docker-compose up -d

# Backend
cd server && npm run dev

# Frontend
npm run dev
```

### Database
```bash
cd server && npm run db:push  # Push schema changes
```

## User Preferences
- Minimal code implementations
- No verbose solutions
- Direct, concise responses
- Batch file operations when possible
