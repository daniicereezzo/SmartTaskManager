# Contributing to Smart Task Manager

Thank you for your interest in contributing to Smart Task Manager! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Documentation](#documentation)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Forked the repository** on GitHub
2. **Cloned your fork** locally
3. **Set up the development environment** (see [SETUP.md](docs/SETUP.md))
4. **Created a branch** for your feature/fix

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/smart-task-manager.git
cd smart-task-manager

# Add upstream remote
git remote add upstream https://github.com/original-owner/smart-task-manager.git

# Install dependencies
./setup.sh  # or follow manual setup in docs/SETUP.md

# Create a new branch
git checkout -b feature/your-feature-name
```

## Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

Examples:
- `feature/google-calendar-integration`
- `fix/scheduling-algorithm-bug`
- `docs/api-documentation-update`

### Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples:
```
feat(scheduling): add energy-based task optimization

fix(api): resolve task creation validation error

docs: update API documentation for new endpoints

test(backend): add unit tests for scheduling service
```

### Git Workflow

1. **Start from main branch**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill out the PR template

## Coding Standards

### General Principles

- **Readability**: Code should be self-documenting
- **Consistency**: Follow existing code patterns
- **Simplicity**: Prefer simple solutions over complex ones
- **Performance**: Consider performance implications
- **Security**: Follow security best practices

### Backend (Node.js/Express)

#### Code Style
- Use **ESLint** with the provided configuration
- Follow **Prettier** formatting rules
- Use **async/await** instead of callbacks
- Use **const/let** instead of var

#### Example:
```javascript
// Good
const createTask = async (req, res) => {
  try {
    const { title, description, taskType } = req.body;
    const task = await Task.create({
      title,
      description,
      taskType,
      userId: req.user.id
    });
    
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Bad
function createTask(req, res) {
  var { title, description, taskType } = req.body;
  Task.create({
    title: title,
    description: description,
    taskType: taskType,
    userId: req.user.id
  }).then(task => {
    res.status(201).json({ success: true, data: task });
  }).catch(error => {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  });
}
```

#### File Structure
```
backend/src/
├── config/
│   └── database.js
├── controllers/
│   └── taskController.js
├── middleware/
│   └── auth.js
├── models/
│   └── Task.js
├── routes/
│   └── tasks.js
├── services/
│   └── SchedulingService.js
└── utils/
    └── helpers.js
```

### Desktop (React/Electron)

#### Code Style
- Use **functional components** with hooks
- Follow **React best practices**
- Use **TypeScript** for type safety
- Use **Tailwind CSS** for styling

#### Example:
```jsx
// Good
import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';

const TaskList = () => {
  const { tasks, fetchTasks, loading } = useTaskStore();
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
```

#### Component Structure
```
desktop/src/
├── components/
│   ├── common/
│   │   ├── Button.js
│   │   └── LoadingSpinner.js
│   ├── forms/
│   │   └── TaskForm.js
│   └── layout/
│       ├── Navbar.js
│       └── Sidebar.js
├── pages/
│   └── TasksPage.js
├── hooks/
│   └── useTasks.js
├── services/
│   └── ApiService.js
└── store/
    └── taskStore.js
```

### Android (Kotlin)

#### Code Style
- Follow **Kotlin coding conventions**
- Use **Jetpack Compose** for UI
- Follow **MVVM architecture**
- Use **Hilt** for dependency injection

#### Example:
```kotlin
// Good
@Composable
fun TaskList(
    tasks: List<Task>,
    onTaskClick: (Task) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(tasks) { task ->
            TaskItem(
                task = task,
                onClick = { onTaskClick(task) }
            )
        }
    }
}

// Bad
@Composable
fun TaskList(tasks: List<Task>, onTaskClick: (Task) -> Unit) {
    Column {
        for (task in tasks) {
            TaskItem(task = task, onClick = { onTaskClick(task) })
        }
    }
}
```

#### Package Structure
```
android/app/src/main/java/com/smarttaskmanager/
├── ui/
│   ├── components/
│   │   └── TaskItem.kt
│   ├── screens/
│   │   └── TaskListScreen.kt
│   └── theme/
│       └── Theme.kt
├── data/
│   ├── local/
│   │   └── TaskDao.kt
│   └── remote/
│       └── TaskApi.kt
├── domain/
│   ├── model/
│   │   └── Task.kt
│   └── usecase/
│       └── GetTasksUseCase.kt
└── di/
    └── AppModule.kt
```

## Testing Guidelines

### Backend Testing

#### Unit Tests
```javascript
// tests/services/SchedulingService.test.js
describe('SchedulingService', () => {
  describe('scheduleTasks', () => {
    it('should schedule tasks based on priority', async () => {
      // Arrange
      const userId = 'user-123';
      const tasks = [
        { id: '1', priority: 1, durationMinutes: 60 },
        { id: '2', priority: 2, durationMinutes: 30 }
      ];
      
      // Act
      const result = await SchedulingService.scheduleTasks(userId);
      
      // Assert
      expect(result.scheduledTasks).toHaveLength(2);
      expect(result.scheduledTasks[0].taskId).toBe('1');
    });
  });
});
```

#### Integration Tests
```javascript
// tests/integration/tasks.test.js
describe('Tasks API', () => {
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        taskType: 'arrangable',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        durationMinutes: 60
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${validToken}`)
        .send(taskData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Task');
    });
  });
});
```

### Frontend Testing

#### React Component Tests
```javascript
// tests/components/TaskItem.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../TaskItem';

describe('TaskItem', () => {
  it('should render task information', () => {
    const task = {
      id: '1',
      title: 'Test Task',
      priority: 2,
      status: 'pending'
    };
    
    render(<TaskItem task={task} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Priority: 2')).toBeInTheDocument();
  });
  
  it('should call onEdit when edit button is clicked', () => {
    const task = { id: '1', title: 'Test Task' };
    const onEdit = jest.fn();
    
    render(<TaskItem task={task} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(task);
  });
});
```

### Android Testing

#### Unit Tests
```kotlin
// test/java/com/smarttaskmanager/domain/GetTasksUseCaseTest.kt
@ExtendWith(MockKExtension::class)
class GetTasksUseCaseTest {
    
    @MockK
    private lateinit var taskRepository: TaskRepository
    
    private lateinit var getTasksUseCase: GetTasksUseCase
    
    @BeforeEach
    fun setup() {
        getTasksUseCase = GetTasksUseCase(taskRepository)
    }
    
    @Test
    fun `should return tasks from repository`() = runTest {
        // Given
        val expectedTasks = listOf(
            Task(id = "1", title = "Task 1"),
            Task(id = "2", title = "Task 2")
        )
        every { taskRepository.getTasks() } returns flowOf(expectedTasks)
        
        // When
        val result = getTasksUseCase().first()
        
        // Then
        assertEquals(expectedTasks, result)
    }
}
```

#### UI Tests
```kotlin
// androidTest/java/com/smarttaskmanager/ui/TaskListScreenTest.kt
@HiltAndroidTest
class TaskListScreenTest {
    
    @get:Rule
    val hiltRule = HiltAndroidRule(this)
    
    @Test
    fun taskList_displaysTasks() {
        // Given
        val tasks = listOf(
            Task(id = "1", title = "Task 1"),
            Task(id = "2", title = "Task 2")
        )
        
        // When
        composeTestRule.setContent {
            TaskListScreen(tasks = tasks)
        }
        
        // Then
        composeTestRule.onNodeWithText("Task 1").assertIsDisplayed()
        composeTestRule.onNodeWithText("Task 2").assertIsDisplayed()
    }
}
```

## Pull Request Process

### Before Submitting

1. **Run tests** locally
   ```bash
   # Backend
   cd backend && npm test
   
   # Desktop
   cd desktop && npm test
   
   # Android
   cd android && ./gradlew test
   ```

2. **Check code style**
   ```bash
   # Backend
   cd backend && npm run lint
   
   # Desktop
   cd desktop && npm run lint
   ```

3. **Update documentation** if needed

4. **Test your changes** thoroughly

### PR Template

When creating a pull request, use this template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #issue_number
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** by QA team (if applicable)
4. **Approval** from at least one maintainer
5. **Merge** after approval

## Issue Guidelines

### Bug Reports

Use this template for bug reports:

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Environment**
- OS: [e.g. Windows 10, macOS 12, Ubuntu 20.04]
- Browser: [e.g. Chrome 96, Firefox 95]
- Version: [e.g. 1.0.0]

**Screenshots**
If applicable, add screenshots

**Additional Context**
Any other context about the problem
```

### Feature Requests

Use this template for feature requests:

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other context about the feature request
```

## Documentation

### Code Documentation

- **Functions**: Document complex functions with JSDoc
- **Classes**: Document class purposes and usage
- **API Endpoints**: Document parameters and responses
- **Configuration**: Document environment variables

### README Updates

When adding new features:
1. Update the main README.md
2. Update relevant documentation in docs/
3. Add examples if applicable
4. Update API documentation

### Documentation Standards

- Use **clear, concise language**
- Include **code examples**
- Provide **step-by-step instructions**
- Keep **documentation up-to-date**

## Getting Help

### Communication Channels

- **GitHub Discussions**: For questions and ideas
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: For real-time chat (invite link in README)

### Resources

- [API Documentation](docs/API.md)
- [Setup Guide](docs/SETUP.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Code Style Guide](docs/CODING_STANDARDS.md)

## Recognition

Contributors will be recognized in:
- **CONTRIBUTORS.md** file
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to Smart Task Manager! 🚀
