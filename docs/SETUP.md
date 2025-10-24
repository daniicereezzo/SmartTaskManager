# Smart Task Manager - Setup Guide

This guide provides detailed instructions for setting up the Smart Task Manager development environment on different operating systems.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Setup (Automated)](#quick-setup-automated)
- [Manual Setup](#manual-setup)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)

## Prerequisites

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 5GB free space
- **Internet**: Required for package downloads and Google Calendar integration

### Required Software

#### 1. Node.js and npm
- **Version**: Node.js 18.x or higher
- **Download**: [nodejs.org](https://nodejs.org/)
- **Verification**: 
  ```bash
  node --version  # Should be 18.x or higher
  npm --version   # Should be 9.x or higher
  ```

#### 2. PostgreSQL
- **Version**: PostgreSQL 12 or higher
- **Download**: [postgresql.org](https://www.postgresql.org/download/)
- **Verification**:
  ```bash
  psql --version  # Should be 12.x or higher
  ```

#### 3. Git
- **Download**: [git-scm.com](https://git-scm.com/)
- **Verification**:
  ```bash
  git --version
  ```

#### 4. Java (for Android development)
- **Version**: Java 11 or higher (OpenJDK recommended)
- **Download**: [adoptium.net](https://adoptium.net/)
- **Verification**:
  ```bash
  java --version  # Should be 11.x or higher
  ```

#### 5. Android SDK (for Android development)
- **Download**: [Android Studio](https://developer.android.com/studio)
- **Required SDK**: API Level 24+ (Android 7.0)
- **Verification**:
  ```bash
  adb --version
  ```

## Quick Setup (Automated)

The easiest way to set up the development environment is using our automated setup script:

### Linux/macOS
```bash
# Clone the repository
git clone https://github.com/your-username/smart-task-manager.git
cd smart-task-manager

# Make the setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### Windows (PowerShell)
```powershell
# Clone the repository
git clone https://github.com/your-username/smart-task-manager.git
cd smart-task-manager

# Run the setup script
.\setup.ps1
```

The automated setup script will:
1. Check system requirements and install missing dependencies
2. Set up PostgreSQL database with proper user and permissions
3. Install all npm dependencies for backend and desktop applications
4. Run database migrations to create all tables, indexes, and triggers
5. Create configuration files (.env) with default values
6. Generate convenience scripts for development
7. Create comprehensive development documentation
8. Handle TypeScript version conflicts automatically
9. Set up proper database connection strings

## Manual Setup

If you prefer to set up the environment manually or the automated script doesn't work:

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit environment variables
nano .env  # or use your preferred editor
```

**Required .env variables:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_task_manager
DB_USER=smarttaskmanager
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Server Configuration
PORT=3000
NODE_ENV=development

# Google Calendar API
GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
```

**Set up the database:**
```bash
# Create database user and database (if not done by setup script)
sudo -u postgres psql -c "CREATE USER smarttaskmanager WITH PASSWORD 'smarttaskmanager123';"
sudo -u postgres psql -c "CREATE DATABASE smart_task_manager OWNER smarttaskmanager;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE smart_task_manager TO smarttaskmanager;"

# Run database migrations (creates all tables, indexes, and triggers)
npm run migrate

# (Optional) Seed the database with sample data
npm run seed
```

**Note:** The migration script (`src/database/migrate.js`) handles:
- PostgreSQL function definitions with dollar-quoted strings
- Complex SQL statements with proper parsing
- Error handling for existing database objects
- Automatic creation of all database schema components

**Start the backend server:**
```bash
npm run dev
```

The backend API will be available at `http://localhost:3000`

### Development Scripts

After running the setup script, several convenience scripts are created in the project root:

```bash
# Start the backend server
./start-backend.sh

# Start the desktop application
./start-desktop.sh

# Build the Android application
./build-android.sh
```

These scripts provide a quick way to start development without navigating to specific directories.

### 2. Desktop Application Setup

```bash
# Navigate to desktop directory
cd desktop

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Required .env variables:**
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

**Start the desktop application:**
```bash
# Development mode (with hot reload)
npm run electron-dev

# Or build and run
npm run build
npm run electron
```

### 3. Android Application Setup

```bash
# Navigate to android directory
cd android

# Create local.properties file
echo "sdk.dir=$HOME/Android/Sdk" > local.properties
# Update the path to your Android SDK location
```

**Build the Android application:**
```bash
# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease
```

## Platform-Specific Instructions

### Windows

#### Prerequisites Installation
1. **Node.js**: Download from [nodejs.org](https://nodejs.org/) and run the installer
2. **PostgreSQL**: Download from [postgresql.org](https://www.postgresql.org/download/windows/) and run the installer
3. **Git**: Download from [git-scm.com](https://git-scm.com/download/win) and run the installer
4. **Java**: Download OpenJDK 11 from [adoptium.net](https://adoptium.net/)
5. **Android Studio**: Download from [developer.android.com](https://developer.android.com/studio)

#### Environment Variables
Set up environment variables in System Properties:
1. Open System Properties → Advanced → Environment Variables
2. Add `ANDROID_HOME` pointing to your Android SDK directory
3. Add `JAVA_HOME` pointing to your Java installation

#### PowerShell Setup Script
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

### macOS

#### Prerequisites Installation
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install PostgreSQL
brew install postgresql
brew services start postgresql

# Install Java
brew install openjdk@11

# Install Android Studio
brew install --cask android-studio
```

#### Environment Variables
Add to your `~/.zshrc` or `~/.bash_profile`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export JAVA_HOME=/opt/homebrew/opt/openjdk@11/libexec/openjdk.jdk/Contents/Home
```

### Linux (Ubuntu/Debian)

#### Prerequisites Installation
```bash
# Update package list
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Java
sudo apt install openjdk-11-jdk

# Install Android Studio dependencies
sudo apt install libc6:i386 libncurses5:i386 libstdc++6:i386 lib32z1 libbz2-1.0:i386

# Install Android Studio
sudo snap install android-studio --classic
```

#### Environment Variables
Add to your `~/.bashrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
```

## Configuration

### Google OAuth Setup

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com/)
2. **Create a new project** or select an existing one
3. **Enable Google+ API** and **Google Calendar API**
4. **Create OAuth 2.0 credentials**:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
5. **Download the credentials** and update your `.env` files

### Database Configuration

#### PostgreSQL Setup
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create user and database
CREATE USER smarttaskmanager WITH PASSWORD 'your_secure_password';
CREATE DATABASE smart_task_manager OWNER smarttaskmanager;
GRANT ALL PRIVILEGES ON DATABASE smart_task_manager TO smarttaskmanager;

-- Exit psql
\q
```

#### Database Migrations
```bash
cd backend
npm run migrate
```

### Environment Configuration

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_task_manager
DB_USER=smarttaskmanager
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Google Calendar
GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

#### Desktop (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_WS_URL=ws://localhost:3000
```

## Troubleshooting

### Common Issues

#### 1. Node.js Version Issues
```bash
# Check Node.js version
node --version

# If version is too old, update using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### 2. PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql

# Check connection
psql -h localhost -U smarttaskmanager -d smart_task_manager
```

#### 3. Android SDK Issues
```bash
# Check Android SDK path
echo $ANDROID_HOME

# Install required SDK components
$ANDROID_HOME/tools/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

#### 4. Permission Issues (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Fix Android SDK permissions
sudo chown -R $(whoami) $ANDROID_HOME
```

#### 5. Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

#### 6. TypeScript Version Conflicts
```bash
# If you encounter TypeScript version conflicts in desktop app
cd desktop

# Check current TypeScript version
npm list typescript

# The setup script automatically fixes this by using TypeScript 4.9.5
# If manual fix is needed:
npm install typescript@^4.9.5 --save-dev
```

#### 7. Database Migration Issues
```bash
# If migration fails, check database connection
cd backend

# Test database connection
npm run migrate

# If connection fails, verify .env file has correct credentials
cat .env | grep DB_

# Reset database if needed
sudo -u postgres psql -c "DROP DATABASE IF EXISTS smart_task_manager;"
sudo -u postgres psql -c "CREATE DATABASE smart_task_manager OWNER smarttaskmanager;"
npm run migrate
```

### Database Issues

#### Reset Database
```bash
cd backend

# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS smart_task_manager;"
sudo -u postgres psql -c "CREATE DATABASE smart_task_manager OWNER smarttaskmanager;"

# Run migrations
npm run migrate

# Seed with sample data
npm run seed
```

#### Database Connection Test
```bash
# Test connection
psql -h localhost -U smarttaskmanager -d smart_task_manager -c "SELECT version();"
```

### Build Issues

#### Desktop Application
```bash
cd desktop

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Electron cache
rm -rf ~/.cache/electron
```

#### Android Application
```bash
cd android

# Clean build
./gradlew clean

# Clear Gradle cache
rm -rf ~/.gradle/caches

# Rebuild
./gradlew assembleDebug
```

## Development Workflow

### Starting Development Servers

#### Option 1: Individual Services
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Desktop
cd desktop
npm run electron-dev

# Terminal 3: Android (when needed)
cd android
./gradlew assembleDebug
```

#### Option 2: Using Development Scripts
```bash
# Start individual services using convenience scripts
./start-backend.sh
./start-desktop.sh
./build-android.sh

# Or start all services (if start-all.sh exists)
./start-all.sh
```

### Development Tools

#### Backend Development
- **API Testing**: Use Postman or curl
- **Database Management**: Use pgAdmin or DBeaver
- **Logs**: Check console output or log files

#### Desktop Development
- **Hot Reload**: Enabled by default
- **DevTools**: Press F12 or Cmd+Option+I
- **Debugging**: Use React Developer Tools

#### Android Development
- **Device**: Use Android Studio emulator or physical device
- **Debugging**: Use Android Studio debugger
- **Logs**: Use `adb logcat`

### Testing

#### Backend Tests
```bash
cd backend
npm test
```

#### Desktop Tests
```bash
cd desktop
npm test
```

#### Android Tests
```bash
cd android
./gradlew test
```

### Code Quality

#### Linting
```bash
# Backend
cd backend
npm run lint

# Desktop
cd desktop
npm run lint
```

#### Formatting
```bash
# Backend
cd backend
npm run format

# Desktop
cd desktop
npm run format
```

## Next Steps

After successful setup:

1. **Read the [API Documentation](API.md)** to understand the backend
2. **Check the [Architecture Overview](ARCHITECTURE.md)** to understand the system design
3. **Follow the [Development Guide](DEVELOPMENT.md)** for development workflow
4. **Start contributing** by checking out the [Contributing Guide](CONTRIBUTING.md)

## Support

If you encounter issues not covered in this guide:

1. **Check the [Troubleshooting](#troubleshooting) section**
2. **Search existing [GitHub Issues](https://github.com/your-username/smart-task-manager/issues)**
3. **Create a new issue** with detailed information about your problem
4. **Join our [Discord community](https://discord.gg/smart-task-manager)** for real-time help

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Android Development Guide](https://developer.android.com/guide)
- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
