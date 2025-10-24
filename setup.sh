#!/bin/bash

# Smart Task Manager Setup Script
# This script sets up the development environment for the Smart Task Manager application

set -e

echo "🚀 Setting up Smart Task Manager..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_error "This setup script is designed for Linux systems"
    exit 1
fi

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "Please do not run this script as root"
    exit 1
fi

print_status "Checking system requirements..."

# Check for required commands
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# Check for Node.js and npm
if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install Node.js and npm first."
    exit 1
fi

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL not found. Installing PostgreSQL..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Check for Java (for Android development)
if ! command -v java &> /dev/null; then
    print_warning "Java not found. Installing OpenJDK 11..."
    sudo apt-get install -y openjdk-11-jdk
fi

# Check for Android SDK (optional)
if ! command -v adb &> /dev/null; then
    print_warning "Android SDK not found. Android development will not be available."
    print_warning "To install Android SDK, follow the official Android Studio setup guide."
fi

print_success "System requirements check completed"

# Setup backend
print_status "Setting up backend..."

cd backend

# Install dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cp .env.example .env
    print_warning "Please edit .env file with your database credentials and API keys"
fi

# Setup database
print_status "Setting up database..."

# Create database user and database
sudo -u postgres psql -c "CREATE USER smarttaskmanager WITH PASSWORD 'smarttaskmanager123';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE smart_task_manager OWNER smarttaskmanager;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE smart_task_manager TO smarttaskmanager;" 2>/dev/null || true

# Run database migrations
print_status "Running database migrations..."
npm run migrate || print_warning "Database migration failed. Please check your database connection."

print_success "Backend setup completed"

# Setup desktop app
print_status "Setting up desktop application..."

cd ../desktop

# Install dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing desktop dependencies..."
    npm install
fi

print_success "Desktop application setup completed"

# Setup Android app
print_status "Setting up Android application..."

cd ../android

# Create local.properties if it doesn't exist
if [ ! -f "local.properties" ]; then
    print_status "Creating local.properties..."
    echo "sdk.dir=$HOME/Android/Sdk" > local.properties
    print_warning "Please update local.properties with your Android SDK path"
fi

print_success "Android application setup completed"

# Create startup scripts
print_status "Creating startup scripts..."

cd ..

# Backend startup script
cat > start-backend.sh << 'EOF'
#!/bin/bash
cd backend
npm run dev
EOF
chmod +x start-backend.sh

# Desktop startup script
cat > start-desktop.sh << 'EOF'
#!/bin/bash
cd desktop
npm run electron-dev
EOF
chmod +x start-desktop.sh

# Android build script
cat > build-android.sh << 'EOF'
#!/bin/bash
cd android
./gradlew assembleDebug
EOF
chmod +x build-android.sh

print_success "Startup scripts created"

# Create development guide
print_status "Creating development guide..."

cat > DEVELOPMENT.md << 'EOF'
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
EOF

print_success "Development guide created"

# Final instructions
print_success "🎉 Smart Task Manager setup completed!"
echo ""
print_status "Next steps:"
echo "1. Edit backend/.env with your database credentials and API keys"
echo "2. Start the backend server: ./start-backend.sh"
echo "3. Start the desktop app: ./start-desktop.sh"
echo "4. Read DEVELOPMENT.md for detailed instructions"
echo ""
print_warning "Note: You'll need to set up Google OAuth credentials for full functionality"
echo ""
print_status "Happy coding! 🚀"
