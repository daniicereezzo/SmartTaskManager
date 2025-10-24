# Smart Task Manager API Documentation

## Overview

The Smart Task Manager API provides a comprehensive RESTful interface for managing tasks, scheduling, user preferences, and Google Calendar integration. All endpoints require authentication via JWT tokens.

**Base URL**: `http://localhost:3000/api`

## Authentication

All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

## Authentication Endpoints

### POST /auth/google
Authenticate with Google OAuth

**Request Body:**
```json
{
  "code": "google_oauth_code",
  "redirectUri": "http://localhost:3000/auth/google/callback"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "pictureUrl": "https://...",
      "timezone": "UTC"
    },
    "token": "jwt_token"
  }
}
```

### POST /auth/refresh
Refresh JWT token

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### POST /auth/logout
Logout user

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Task Endpoints

### GET /tasks
Get all tasks for the authenticated user

**Query Parameters:**
- `type` (optional): Filter by task type (`mandatory`, `desired`, `arrangable`)
- `status` (optional): Filter by status (`pending`, `in_progress`, `completed`, `cancelled`)
- `startDate` (optional): Filter tasks starting from this date (ISO format)
- `endDate` (optional): Filter tasks ending before this date (ISO format)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Complete project report",
      "description": "Write the quarterly project report",
      "taskType": "arrangable",
      "startDate": "2024-01-15",
      "endDate": "2024-01-20",
      "startTime": "09:00",
      "endTime": "11:00",
      "durationMinutes": 120,
      "priority": 2,
      "workloadEnergy": "high",
      "status": "pending",
      "completionPercentage": 0,
      "alarmMinutesBefore": 15,
      "notificationEnabled": true,
      "isRecurring": false,
      "recurrencePattern": null,
      "scheduledAt": "2024-01-15T09:00:00Z",
      "completedAt": null,
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z",
      "category": {
        "id": "uuid",
        "name": "Work",
        "color": "#3B82F6"
      },
      "scheduledSlots": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "pages": 1
  }
}
```

### GET /tasks/:id
Get a specific task by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Complete project report",
    "description": "Write the quarterly project report",
    "taskType": "arrangable",
    "startDate": "2024-01-15",
    "endDate": "2024-01-20",
    "startTime": "09:00",
    "endTime": "11:00",
    "durationMinutes": 120,
    "priority": 2,
    "workloadEnergy": "high",
    "status": "pending",
    "completionPercentage": 0,
    "alarmMinutesBefore": 15,
    "notificationEnabled": true,
    "isRecurring": false,
    "recurrencePattern": null,
    "scheduledAt": "2024-01-15T09:00:00Z",
    "completedAt": null,
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T10:00:00Z",
    "category": {
      "id": "uuid",
      "name": "Work",
      "color": "#3B82F6"
    },
    "scheduledSlots": []
  }
}
```

### POST /tasks
Create a new task

**Request Body:**
```json
{
  "title": "Complete project report",
  "description": "Write the quarterly project report",
  "categoryId": "uuid",
  "taskType": "arrangable",
  "startDate": "2024-01-15",
  "endDate": "2024-01-20",
  "startTime": "09:00",
  "endTime": "11:00",
  "durationMinutes": 120,
  "priority": 2,
  "workloadEnergy": "high",
  "alarmMinutesBefore": 15,
  "notificationEnabled": true,
  "isRecurring": false,
  "recurrencePattern": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Complete project report",
    "description": "Write the quarterly project report",
    "taskType": "arrangable",
    "startDate": "2024-01-15",
    "endDate": "2024-01-20",
    "startTime": "09:00",
    "endTime": "11:00",
    "durationMinutes": 120,
    "priority": 2,
    "workloadEnergy": "high",
    "status": "pending",
    "completionPercentage": 0,
    "alarmMinutesBefore": 15,
    "notificationEnabled": true,
    "isRecurring": false,
    "recurrencePattern": null,
    "scheduledAt": null,
    "completedAt": null,
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T10:00:00Z"
  }
}
```

### PUT /tasks/:id
Update an existing task

**Request Body:** (Same as POST, all fields optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated task title",
    // ... other updated fields
  }
}
```

### DELETE /tasks/:id
Delete a task

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### POST /tasks/schedule
Trigger automatic scheduling for arrangable tasks

**Request Body:**
```json
{
  "startDate": "2024-01-15",
  "endDate": "2024-01-30"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scheduling completed",
  "data": {
    "scheduledTasks": [
      {
        "taskId": "uuid",
        "scheduledDate": "2024-01-15",
        "scheduledStartTime": "09:00",
        "scheduledEndTime": "11:00",
        "isConfirmed": false
      }
    ],
    "conflicts": [],
    "overruns": []
  }
}
```

### GET /tasks/scheduled/:date
Get scheduled tasks for a specific date

**Path Parameters:**
- `date`: Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "scheduledDate": "2024-01-15",
      "scheduledStartTime": "09:00",
      "scheduledEndTime": "11:00",
      "isConfirmed": false,
      "task": {
        "id": "uuid",
        "title": "Complete project report",
        "description": "Write the quarterly project report",
        "taskType": "arrangable",
        "priority": 2,
        "workloadEnergy": "high",
        "category": {
          "id": "uuid",
          "name": "Work",
          "color": "#3B82F6"
        }
      }
    }
  ]
}
```

### PUT /tasks/:id/status
Update task status

**Request Body:**
```json
{
  "status": "in_progress",
  "completionPercentage": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "in_progress",
    "completionPercentage": 50,
    "updatedAt": "2024-01-10T10:00:00Z"
  }
}
```

### POST /tasks/sync-calendar
Sync all tasks with Google Calendar

**Response:**
```json
{
  "success": true,
  "message": "Calendar sync completed",
  "data": {
    "syncedTasks": 15,
    "createdEvents": 8,
    "updatedEvents": 5,
    "deletedEvents": 2
  }
}
```

## Task Category Endpoints

### GET /categories
Get all task categories for the authenticated user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Work",
      "description": "Work-related tasks",
      "color": "#3B82F6",
      "icon": "briefcase",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### POST /categories
Create a new task category

**Request Body:**
```json
{
  "name": "Personal",
  "description": "Personal tasks",
  "color": "#10B981",
  "icon": "user"
}
```

### PUT /categories/:id
Update a task category

### DELETE /categories/:id
Delete a task category

## User Preferences Endpoints

### GET /preferences
Get user preferences

**Response:**
```json
{
  "success": true,
  "data": {
    "themePreference": "dark",
    "timezone": "America/New_York",
    "dailyPreferences": [
      {
        "dayOfWeek": 1,
        "availableStartTime": "09:00",
        "availableEndTime": "17:00",
        "maxWorkloadMinutes": 480
      }
    ],
    "energyPatterns": [
      {
        "dayOfWeek": 1,
        "timeSlotStart": "09:00",
        "timeSlotEnd": "12:00",
        "energyLevel": "high",
        "productivityScore": 0.9
      }
    ]
  }
}
```

### PUT /preferences
Update user preferences

**Request Body:**
```json
{
  "themePreference": "dark",
  "timezone": "America/New_York",
  "dailyPreferences": [
    {
      "dayOfWeek": 1,
      "availableStartTime": "09:00",
      "availableEndTime": "17:00",
      "maxWorkloadMinutes": 480
    }
  ],
  "energyPatterns": [
    {
      "dayOfWeek": 1,
      "timeSlotStart": "09:00",
      "timeSlotEnd": "12:00",
      "energyLevel": "high",
      "productivityScore": 0.9
    }
  ]
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired JWT token |
| `INSUFFICIENT_PERMISSIONS` | User doesn't have permission for this action |
| `TASK_NOT_FOUND` | Task not found |
| `CATEGORY_NOT_FOUND` | Category not found |
| `VALIDATION_ERROR` | Request validation failed |
| `GOOGLE_CALENDAR_ERROR` | Google Calendar integration error |
| `SCHEDULING_CONFLICT` | Task scheduling conflict |
| `INSUFFICIENT_TIME` | Not enough time available for scheduling |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 10 requests per 15 minutes
- **Scheduling endpoints**: 20 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## WebSocket Events

The API supports real-time updates via WebSocket connections:

### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

#### `task_created`
Emitted when a new task is created
```json
{
  "task": {
    "id": "uuid",
    "title": "New task",
    // ... other task fields
  }
}
```

#### `task_updated`
Emitted when a task is updated
```json
{
  "task": {
    "id": "uuid",
    "title": "Updated task",
    // ... other updated fields
  }
}
```

#### `task_deleted`
Emitted when a task is deleted
```json
{
  "taskId": "uuid"
}
```

#### `task_scheduled`
Emitted when a task is automatically scheduled
```json
{
  "taskId": "uuid",
  "scheduledDate": "2024-01-15",
  "scheduledStartTime": "09:00",
  "scheduledEndTime": "11:00"
}
```

#### `calendar_synced`
Emitted when calendar sync is completed
```json
{
  "syncedTasks": 15,
  "createdEvents": 8,
  "updatedEvents": 5,
  "deletedEvents": 2
}
```

## Examples

### Creating a Task with Scheduling
```javascript
// Create a new arrangable task
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    title: 'Write documentation',
    description: 'Complete API documentation',
    taskType: 'arrangable',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    durationMinutes: 180,
    priority: 2,
    workloadEnergy: 'medium'
  })
});

// Trigger automatic scheduling
const scheduleResponse = await fetch('/api/tasks/schedule', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    startDate: '2024-01-15',
    endDate: '2024-01-30'
  })
});
```

### Real-time Updates
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your_jwt_token' }
});

socket.on('task_scheduled', (data) => {
  console.log('Task scheduled:', data);
  // Update UI with new scheduled task
});

socket.on('calendar_synced', (data) => {
  console.log('Calendar sync completed:', data);
  // Show sync status to user
});
```

## Testing

You can test the API using tools like Postman, curl, or any HTTP client:

```bash
# Get all tasks
curl -H "Authorization: Bearer your_token" \
     http://localhost:3000/api/tasks

# Create a new task
curl -X POST \
     -H "Authorization: Bearer your_token" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test task","taskType":"arrangable","startDate":"2024-01-15","endDate":"2024-01-20","durationMinutes":60,"priority":1}' \
     http://localhost:3000/api/tasks
```

For more detailed testing examples and integration guides, see the [Testing Guide](TESTING.md).
