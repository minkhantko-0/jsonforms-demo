# Notifications Feature

## Setup

### Option 1: Using Migrations (Recommended)
```bash
cd server
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
```

### Option 2: Push Schema Directly
```bash
cd server
npm run db:push
```

2. Start the server and client as usual

## Features

### Server (CRUD API)
- `GET /api/notifications` - Get all notifications
- `POST /api/notifications` - Create notification (body: `{title, message}`)
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/stream` - SSE endpoint for real-time notifications

### Client
- New "Notifications" page accessible from navigation
- Unread badge shows count on navigation button
- Each unread notification has a badge indicator
- Mark as read button (envelope icon)
- Delete button (trash icon)
- Real-time notifications via SSE (established on app start)
- Toast notifications appear instantly when new notifications are created

### Auto-Notifications
Notifications are automatically created for:

**Form Submission Flow (2 notifications):**
1. ✅ **Form Accepted** - When backend validates and accepts form data
2. ✅ **Processing Success** - When form is successfully saved to database
   OR ❌ **Processing Failed** - If database save fails

**Error Notifications:**
- ❌ Validation errors (invalid form data)
- ❌ File upload failures
- ❌ Session not found errors
