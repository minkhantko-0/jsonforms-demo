# JSON Forms Dynamic Form Builder

A dynamic form builder application that generates forms from JSON schemas with real-time validation, custom renderers, and data persistence.

## Features

- **Dynamic Form Generation**: Create forms from JSON Schema definitions
- **Custom Renderers**: Star rating, age slider, and file upload components
- **File Upload**: UploadThing integration for image and PDF uploads
- **Real-time Validation**: Client and server-side validation with custom error messages
- **Server-Sent Events**: Async processing with SSE notifications
- **Data Persistence**: MySQL database with Drizzle ORM
- **View Submissions**: Expandable table view of all submitted data

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- JSON Forms (Material-UI renderers)
- TanStack Query (React Query)
- Material-UI v7
- Notistack (toast notifications)
- Vite

**Backend:**
- Hono (API framework)
- Drizzle ORM
- MySQL 8.0
- Zod (validation)
- UploadThing (file storage)
- Server-Sent Events

## Setup Instructions

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### 1. Clone Repository
```bash
git clone <repository-url>
cd demo-json-forms
```

### 2. Start MySQL Database
```bash
cd server
docker-compose up -d
```

### 3. Configure UploadThing
```bash
# Create .env file in server directory
cd server
echo UPLOADTHING_TOKEN=your_token_here > .env
```
Get your token from https://uploadthing.com

### 4. Setup Backend
```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start server (runs on port 3001)
npm run dev
```

### 5. Setup Frontend
```bash
# In root directory
npm install

# Start dev server (runs on port 3000)
npm run dev
```

### 6. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Usage

### Creating Forms
1. Edit JSON Schema in the left panel
2. Click "Format & Save" to update the form
3. Fill out the generated form in the middle panel
4. View bound data in the right panel

### Custom Renderers
- Fields ending with `rating` → Star rating component
- Fields ending with `age` → Slider component
- Fields with `format: "data-url"` → File upload component

### Submitting Data
1. Fill out the form
2. Click "Submit"
3. Wait for validation
4. Success toast appears immediately
5. After 15 seconds, SSE completes and data is saved to database
6. Second toast notification appears

### Viewing Submissions
1. Click "View Submissions" button
2. See list of all submissions
3. Click arrow icon to expand and view full data

## Project Structure

```
demo-json-forms/
├── src/
│   ├── components/
│   │   ├── JsonFormsDemo.tsx      # Main form component
│   │   ├── ViewSubmissions.tsx    # Submissions table
│   │   ├── RatingControl.tsx      # Star rating renderer
│   │   ├── AgeSliderControl.tsx   # Age slider renderer
│   │   └── FileUploadControl.tsx  # File upload renderer
│   ├── schema.json                # Default JSON schema
│   └── main.tsx                   # App entry point
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts          # Drizzle schema
│   │   │   └── index.ts           # DB connection
│   │   └── index.ts               # Hono API server
│   ├── .env                       # Environment variables
│   └── docker-compose.yml         # MySQL container
└── README.md
```

## API Endpoints

- `POST /api/submit` - Submit form data (JSON or FormData with files)
- `GET /api/submissions` - Get all submissions
- `GET /api/events/:sessionId` - SSE endpoint for async processing

## Custom Error Messages

Add `errorMessage` to schema properties:

```json
{
  "name": {
    "type": "string",
    "minLength": 3,
    "errorMessage": {
      "minLength": "Name must be at least 3 characters"
    }
  }
}
```

## File Upload

Add file upload field to schema:

```json
{
  "profilePicture": {
    "type": "string",
    "format": "data-url",
    "title": "Profile Picture"
  }
}
```

Files are uploaded to UploadThing and URLs are stored in the database.

## Development

- Frontend hot reload: Vite HMR
- Backend hot reload: tsx watch mode
- Database changes: Run `npm run db:push` in server directory

## Environment Variables

### Server (.env)
```
UPLOADTHING_TOKEN=your_uploadthing_token
```
