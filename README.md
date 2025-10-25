# Let's Todo App - Frontend (Developer Branch)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![ES Modules](https://img.shields.io/badge/ES-Modules-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

> **🚧 Developer Branch**: This is the main development branch containing the latest features and improvements. For production deployment, use the `main` branch.

## 🎯 Overview

Let's Todo App Frontend is a modern, lightweight Single Page Application built with vanilla JavaScript ES6+ modules. This developer branch serves as the integration point for new features and the testing ground for experimental implementations.

### ✨ Key Features

- 📝 **Complete Todo Management**: Create, read, update, delete todos with rich content support
- 👤 **User Authentication**: Secure login/registration system with session management
- 🌓 **Dark/Light Theme**: Seamless theme switching with user preference persistence
- 📱 **Responsive Design**: Mobile-first approach with touch-friendly interface
- 🔄 **Real-time Sync**: Live updates between frontend and backend
- 📤 **Import/Export**: JSON-based data portability
- 🗑️ **Trash System**: Soft delete with restore functionality
- 🎨 **Modern UI**: Clean, intuitive interface with accessibility support

### 🏗️ Architecture

- **Framework**: Vanilla JavaScript (ES6+ Modules)
- **Module System**: Native ES modules (no bundler required)
- **Server**: Express.js development server with LiveReload
- **State Management**: Centralized reactive state system
- **Routing**: Client-side SPA routing
- **Styling**: CSS3 with CSS Variables for theming
- **API Integration**: RESTful backend communication

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+
- **npm** or **yarn**
- **Git**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lets-todo-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development URLs

- **Frontend**: http://127.0.0.1:5500
- **Backend API**: http://127.0.0.1:3000
- **LiveReload**: Port 35729

## 🛠️ Development Scripts

| Command              | Description                                        |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Start full development environment with hot reload |
| `npm start`          | Start server without live reload                   |
| `npm run watch`      | Server with file watching (no live reload)         |
| `npm run livereload` | LiveReload service only                            |
| `npm run docs`       | Generate JSDoc documentation                       |

## 📁 Project Structure

```
lets-todo-app/
├── 📄 index.html                # Main application entry point
├── 🔧 dev-server.js             # Express development server
├── 📦 package.json              # Dependencies and scripts
├── 📋 DEPLOYMENT.md             # Deployment instructions
├── 📖 copilot-instructions.md   # Development guidelines
├──
├── 📂 src/                      # Source code
│   ├── 📄 app.js                # Application initialization
│   ├── 📂 components/           # UI components
│   │   ├── action-view.js       # Todo action dialogs
│   │   ├── main-content.js      # Main content wrapper
│   │   └── pages/               # Page components
│   ├── 📂 services/             # Business logic layer
│   │   ├── api/                 # API communication
│   │   ├── crud/                # CRUD operations
│   │   └── navigation/          # Navigation services
│   ├── 📂 state/                # State management
│   │   ├── main-state.js        # Central state store
│   │   ├── session-manager.js   # User session handling
│   │   └── ui-state-manager.js  # UI state management
│   ├── 📂 utils/                # Utility functions
│   │   ├── import-export/       # Data import/export
│   │   ├── ui-helpers/          # UI helper functions
│   │   └── constants.js         # Application constants
│   └── 📂 styles/               # Component styles
│       ├── base.css             # Base styles
│       ├── main.css             # Main application styles
│       └── data-theme.css       # Theme definitions
│
├── 📂 assets/                   # Static assets
│   ├── icons/                   # Application icons
│   ├── img/                     # Images
│   ├── fonts/                   # Custom fonts
│   ├── styles/                  # Global styles
│   │   └── comic.css            # Comic theme
│   └── web-app/                 # PWA assets
│       └── manifest.json        # Web app manifest
│
└── 🔧 .htaccess                 # Apache configuration
```

## 🔧 Core Technologies

### Frontend Stack

- **JavaScript**: ES6+ with modules, async/await, destructuring
- **HTML5**: Semantic markup with accessibility attributes
- **CSS3**: Grid, Flexbox, Custom Properties, Animations
- **PWA**: Service Worker ready, Web App Manifest

### Development Tools

- **Express.js**: Development server with static file serving
- **LiveReload**: Automatic browser refresh on file changes
- **Nodemon**: File watching and server restart
- **Concurrently**: Parallel script execution
- **JSDoc**: Documentation generation

## 🎨 Theming System

The application supports multiple themes with CSS custom properties:

- **Light Theme**: Clean, bright interface
- **Dark Theme**: Easy on the eyes for extended use
- **Comic Theme**: Playful, colorful design
- **Custom Themes**: Easily extendable theme system

```css
/* Theme switching via CSS custom properties */
:root {
  --primary-color: #007bff;
  --background-color: #ffffff;
  --text-color: #333333;
}

[data-theme="dark"] {
  --primary-color: #4dabf7;
  --background-color: #1a1a1a;
  --text-color: #ffffff;
}
```

## 🔄 State Management

Centralized reactive state system with:

- **Main State**: Todo data, user information, application settings
- **UI State**: View states, modal visibility, loading indicators
- **Session State**: Authentication status, user preferences
- **Persistence**: Local storage backup with server synchronization

```javascript
// Example state access
import { getTodos, addTodo, updateTodo } from "./state/main-state.js";

// Reactive updates trigger UI re-rendering
addTodo(newTodoData);
```

## 🧩 Component Architecture

Modular component system with:

- **Page Components**: Main application views
- **UI Components**: Reusable interface elements
- **Service Components**: Business logic handlers
- **Utility Components**: Helper functions and constants

```javascript
// Component example
export const TodoItem = (todo) => {
  return `
    <div class="todo-item" data-todo-id="${todo.id}">
      <h3>${todo.title}</h3>
      <p>${todo.content}</p>
    </div>
  `;
};
```

## 🔌 API Integration

RESTful API communication with:

- **Authentication**: Cookie-based session management
- **CRUD Operations**: Full todo lifecycle management
- **Error Handling**: Comprehensive error states and recovery
- **Offline Support**: Local storage fallback

```javascript
// API service example
import { apiRequest } from "./api/api-client.js";

export const createTodo = async (todoData) => {
  return await apiRequest("POST", "/todos", todoData);
};
```

## 🧪 Development Workflow

### Feature Development

1. Create feature branch from `feature/main-feature`
2. Implement feature with tests
3. Update documentation
4. Submit pull request for review

### Code Quality

- **ESLint**: Code linting and formatting
- **JSDoc**: Comprehensive function documentation
- **14-Line Limit**: Maximum function length for maintainability
- **Single Responsibility**: One task per function

### Testing Strategy

- **Manual Testing**: Browser-based testing across devices
- **Performance Testing**: Core Web Vitals monitoring
- **Accessibility Testing**: WCAG compliance checking
- **Cross-Browser Testing**: Modern browser compatibility

## 📱 Progressive Web App

PWA features include:

- **Service Worker**: Offline functionality (ready for implementation)
- **Web App Manifest**: Native app-like experience
- **Responsive Design**: Works on all device sizes
- **Touch Support**: Mobile-optimized interactions

## 🔒 Security Features

- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Secure cookie handling
- **Input Validation**: Client and server-side validation
- **Secure Communication**: HTTPS recommended for production

## 🐛 Troubleshooting

### Common Development Issues

**Module Import Errors**

```bash
# Ensure .js extensions in import statements
import { function } from './module.js';
```

**Port Conflicts**

```bash
# Server automatically finds available port
# Check console output for actual port
```

**LiveReload Issues**

```bash
# Restart development server
npm run dev
```

**API Connection Problems**

```bash
# Verify backend is running on port 3000
# Check browser network tab for errors
```

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT.md)**: Production deployment instructions
- **[Development Guidelines](copilot-instructions.md)**: Coding standards and conventions
- **[API Documentation](../lets-todo-api/README.md)**: Backend API reference

## 🤝 Contributing

### Development Guidelines

- Follow the 14-line function limit rule
- Write comprehensive JSDoc comments
- Use semantic HTML and accessible markup
- Test across different browsers and devices
- Maintain consistent code formatting

### Pull Request Process

1. Update documentation for any new features
2. Ensure all functions have proper JSDoc comments
3. Test functionality across different screen sizes
4. Verify accessibility compliance

## 🔮 Roadmap

### Planned Features

- [ ] Advanced search and filtering
- [ ] Todo categorization and tagging
- [ ] Collaborative sharing
- [ ] Enhanced offline functionality
- [ ] Plugin system for extensions

### Technical Improvements

- [ ] Service Worker implementation
- [ ] Performance optimizations
- [ ] Enhanced accessibility features
- [ ] Advanced PWA capabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions, issues, or contributions:

1. Check existing documentation
2. Review troubleshooting section
3. Create an issue on GitHub
4. Contact the development team

---

**Happy coding! 🚀**
