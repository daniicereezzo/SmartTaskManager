# Smart Task Manager - Development Guide

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL 12 or higher
- Java 11 or higher (for Android development)
- Android SDK (for Android development)

## Quick Start

### 1. Start the Backend Server
```bash
./start-backend.sh
```
The API will be available at http://localhost:3000

### 2. Start the Desktop Application
```bash
./start-desktop.sh
```

### 3. Build Android Application
```bash
./build-android.sh
```

## Project Structure

```
smart-task-manager/
├── backend/          # Node.js API server
├── desktop/          # Electron desktop application
├── android/          # Native Android application
└── docs/            # Documentation
```

## Environment Setup

1. Copy `.env.example` to `.env` in the backend directory
2. Update database credentials in `.env`
3. Add Google OAuth credentials for calendar integration
4. Update Android SDK path in `android/local.properties`

## Database Setup

The application uses PostgreSQL. The database schema is automatically created when you run the backend server for the first time.

## API Documentation

The API documentation is available at http://localhost:3000/api-docs when the backend is running.

## Features

- **Automatic Task Scheduling**: Intelligent algorithm that considers deadlines, priorities, and energy levels
- **Google Calendar Integration**: Sync tasks with Google Calendar
- **Cross-Platform**: Desktop (Electron) and Android applications
- **Offline Support**: Tasks sync when connection is restored
- **Dark/Light Theme**: User preference support
- **Real-time Updates**: WebSocket support for live updates

## Development

### Backend Development
- Uses Node.js with Express
- PostgreSQL database with Sequelize ORM
- JWT authentication
- Google Calendar API integration

### Desktop Development
- Electron with React
- Tailwind CSS for styling
- Zustand for state management
- Real-time updates via WebSocket

### Android Development
- Native Android with Kotlin
- Jetpack Compose for UI
- Room database for local storage
- Hilt for dependency injection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
