# Smart Task Manager

A comprehensive, intelligent task management application that automatically organizes tasks in a calendar based on deadlines, priorities, energy levels, and available time. The application provides a seamless experience across desktop and mobile platforms with real-time synchronization and Google Calendar integration.

## 🚀 Features

### Core Functionality
- **Intelligent Task Scheduling**: Advanced algorithm that considers deadlines, priorities, energy levels, and user preferences
- **Multi-Platform Support**: Native desktop (Electron) and Android applications
- **Google Calendar Integration**: Seamless sync with Google Calendar for unified scheduling
- **Offline Capability**: Full offline functionality with automatic sync when connection is restored
- **Real-time Updates**: WebSocket-based real-time synchronization across devices
- **Dark/Light Theme**: User preference support with system theme detection

### Task Management
- **Three Task Types**:
  - **Mandatory**: Fixed tasks that cannot be moved (e.g., meetings, appointments)
  - **Desired**: Preferable tasks with specific time slots (e.g., preferred workout times)
  - **Arrangable**: Tasks to be automatically scheduled by the algorithm
- **Priority System**: 5-level priority system (1 = highest priority)
- **Energy Level Matching**: Tasks are scheduled based on user's energy patterns
- **Dependency Management**: Support for task dependencies and prerequisites
- **Recurring Tasks**: Full support for recurring task patterns

### Smart Scheduling Algorithm
- **Energy-Based Optimization**: Matches task energy requirements with user's energy patterns
- **Conflict Resolution**: Intelligent handling of scheduling conflicts
- **Time Slot Optimization**: Finds the best available time slots based on productivity patterns
- **Deadline Awareness**: Prioritizes tasks based on urgency and deadlines
- **User Preference Respect**: Honors daily available time and preferred working hours

## 🏗️ Architecture

```
smart-task-manager/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── config/       # Database and app configuration
│   │   ├── models/       # Sequelize data models
│   │   ├── routes/       # Express API routes
│   │   ├── services/     # Business logic services
│   │   ├── middleware/   # Authentication and validation
│   │   └── utils/        # Utility functions
│   └── package.json
├── desktop/              # Electron desktop application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Application pages
│   │   ├── services/     # API and authentication services
│   │   ├── store/        # Zustand state management
│   │   └── utils/        # Utility functions
│   └── package.json
├── android/              # Native Android application
│   ├── app/src/main/
│   │   ├── java/com/smarttaskmanager/
│   │   │   ├── ui/       # Jetpack Compose UI
│   │   │   ├── data/     # Room database and repositories
│   │   │   ├── domain/   # Business logic and use cases
│   │   │   └── di/       # Hilt dependency injection
│   │   └── res/          # Android resources
│   └── build.gradle
├── docs/                 # Comprehensive documentation
└── setup.sh             # Automated setup script
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with Google OAuth 2.0
- **Calendar Integration**: Google Calendar API
- **Real-time**: Socket.io for WebSocket communication
- **Security**: Helmet, CORS, rate limiting

### Desktop Application
- **Framework**: Electron with React 18
- **UI Library**: Tailwind CSS with Headless UI
- **State Management**: Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Create React App

### Android Application
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose with Material Design 3
- **Architecture**: MVVM with Clean Architecture
- **Dependency Injection**: Hilt
- **Database**: Room with offline-first approach
- **Networking**: Retrofit with OkHttp
- **Background Tasks**: WorkManager
- **Authentication**: Google Play Services Auth

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 12 or higher
- Java 11 or higher (for Android development)
- Android SDK (for Android development)

### Automated Setup
```bash
# Clone the repository
git clone https://github.com/your-username/smart-task-manager.git
cd smart-task-manager

# Run the automated setup script
chmod +x setup.sh
./setup.sh
```

The setup script will automatically:
- Check system requirements and install missing dependencies
- Set up PostgreSQL database with proper user and permissions
- Install all npm dependencies for backend and desktop applications
- Run database migrations to create all tables and indexes
- Create configuration files (.env) with default values
- Generate convenience scripts for development
- Create comprehensive development documentation

### Manual Setup

#### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials and API keys

# Set up database (if not done by setup script)
sudo -u postgres psql -c "CREATE USER smarttaskmanager WITH PASSWORD 'smarttaskmanager123';"
sudo -u postgres psql -c "CREATE DATABASE smart_task_manager OWNER smarttaskmanager;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE smart_task_manager TO smarttaskmanager;"

# Run database migrations
npm run migrate

# (Optional) Seed database with sample data
npm run seed

# Start the development server
npm run dev
```

#### 2. Desktop Application
```bash
cd desktop
npm install
npm run electron-dev
```

#### 3. Android Application
```bash
cd android
# Update local.properties with your Android SDK path
./gradlew assembleDebug
```

### Development Scripts

After running the setup script, several convenience scripts are created:

```bash
# Start the backend server
./start-backend.sh

# Start the desktop application
./start-desktop.sh

# Build the Android application
./build-android.sh
```

## 📚 Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Architecture Overview](docs/ARCHITECTURE.md) - System design and patterns
- [Development Guide](DEVELOPMENT.md) - Development workflow and guidelines
- [Contributing](CONTRIBUTING.md) - How to contribute to the project

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_task_manager
DB_USER=smarttaskmanager
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Server
PORT=3000
NODE_ENV=development
```

#### Desktop (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🎯 Key Features Deep Dive

### Intelligent Scheduling Algorithm

The scheduling algorithm is the heart of the Smart Task Manager. It uses multiple factors to optimize task placement:

1. **Energy Level Matching**: Tasks are matched with user's energy patterns
2. **Priority Weighting**: Higher priority tasks get better time slots
3. **Deadline Proximity**: Urgent tasks are scheduled earlier
4. **Conflict Avoidance**: Prevents double-booking and time conflicts
5. **User Preferences**: Respects daily available time and working hours

### Task Types Explained

- **Mandatory Tasks**: Cannot be moved once scheduled (e.g., doctor appointments, meetings)
- **Desired Tasks**: Have preferred time slots but can be moved if necessary
- **Arrangable Tasks**: Fully flexible, scheduled automatically by the algorithm

### Energy Pattern Recognition

The system learns from user behavior to optimize scheduling:
- Tracks productivity patterns throughout the day
- Matches high-energy tasks with peak energy times
- Schedules low-energy tasks during natural dips
- Adapts to weekly patterns and seasonal changes

## 🔒 Security

- **Authentication**: JWT tokens with Google OAuth integration
- **Authorization**: Role-based access control
- **Data Protection**: All sensitive data encrypted at rest
- **API Security**: Rate limiting, CORS, and input validation
- **Privacy**: GDPR compliant data handling

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Desktop tests
cd desktop
npm test

# Android tests
cd android
./gradlew test
```

## 📱 Platform-Specific Features

### Desktop
- Native menu integration
- System tray support
- Keyboard shortcuts
- Auto-updater
- Offline mode with sync

### Android
- Material Design 3 UI
- Offline-first architecture
- Background sync
- Push notifications
- Widget support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join our GitHub Discussions for questions and ideas

## 🗺️ Roadmap

- [ ] iOS application
- [ ] Web application
- [ ] Advanced analytics and insights
- [ ] Team collaboration features
- [ ] AI-powered task suggestions
- [ ] Integration with more calendar providers
- [ ] Voice commands and natural language processing

---

**Smart Task Manager** - Making productivity intelligent, one task at a time. 🚀
