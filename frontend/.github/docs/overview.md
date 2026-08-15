```ascii
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ LETS-TODO FRONTEND - DEVELOPER BRANCH ARCHITECTURE │
 │ Development & Experimental Features │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ MODERN WEB STACK & DEPENDENCIES │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ Vanilla JavaScript ES6+ → No build step, native modules │
 │ CSS3 + CSS Variables → Modern styling with theme system │
 │ Express.js (dev-server) → Development server with LiveReload │
 │ PWA Ready → Service Worker + Web App Manifest │
 │ Component Architecture → Modular ES6 class-based components │
 │ No Build Pipeline → Direct browser execution, fast development │
 │ Enhanced Dev Tools → Debug logging and development helpers │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ DEV-SERVER.JS (Development Entry) │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ Express Development Server │
 │ │ │
 │ ├── Static File Serving → All assets and src files │
 │ ├── LiveReload Integration → Auto-refresh on file changes │
 │ ├── Request Logging → Enhanced development logging │
 │ ├── CORS Headers → API communication setup │
 │ └── Fallback Routes → SPA routing support │
 │ │
 │ Development Features: │
 │ ├── Hot reload without build step │
 │ ├── File change monitoring │
 │ ├── Experimental feature testing │
 │ ├── Network request debugging │
 │ └── Enhanced error reporting │
 │ │
 │ Server: http://localhost:3001 (configurable) │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ INDEX.HTML (App Shell) │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ HTML5 Semantic Structure │
 │ │ │
 │ ├── PWA Meta Tags → Manifest, theme colors, viewport │
 │ ├── CSS Imports → Theme system and component styles │
 │ ├── ES6 Module Imports → Main app.js entry point │
 │ ├── Development Scripts → Debug helpers and dev tools │
 │ └── App Container → <div id="app"> mounting point │
 │ │
 │ Development Additions: │
 │ ├── Debug panel toggle │
 │ ├── Performance monitoring │
 │ ├── Console logging enhancements │
 │ └── Experimental feature flags │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ SRC/APP.JS (Application Core) │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ Main Application Controller │
 │ │ │
 │ ├── Component Registration → Register all UI components │
 │ ├── State Management Init → Initialize app state and persistence │
 │ ├── Navigation Setup → Router and page management │
 │ ├── Session Management → Authentication and user state │
 │ └── Theme System Init → Dark/light mode and preferences │
 │ │
 │ Developer Features: │
 │ ├── Debug Mode Toggle → Enhanced logging and dev tools │
 │ ├── Performance Metrics → Component render times │
 │ ├── State Inspector → Real-time state debugging │
 │ ├── Feature Flag System → Experimental feature control │
 │ └── Hot Module Replacement → Component-level updates │
 │ │
 │ Lifecycle: Init → Mount → Render → Update → Destroy │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ COMPONENT ARCHITECTURE (ES6 Classes) │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ Base Component Pattern: │
 │ │ │
 │ ├── components/pages/ → Page-level components │
 │ │ ├── LoginPage.js → Authentication interface │
 │ │ ├── DashboardPage.js → Main todo dashboard │
 │ │ ├── RegisterPage.js → User registration │
 │ │ └── SettingsPage.js → User preferences │
 │ │ │
 │ ├── components/ → Reusable UI components │
 │ │ ├── ActionView.js → Context action buttons │
 │ │ ├── MainContent.js → Primary content container │
 │ │ ├── TodoItem.js → Individual todo component │
 │ │ └── Modal.js → Dialog and popup system │
 │ │ │
 │ Component Lifecycle: │
 │ ├── constructor() → Initialize component state │
 │ ├── render() → Generate DOM structure │
 │ ├── mount() → Attach to DOM and bind events │
 │ ├── update() → React to state changes │
 │ └── destroy() → Cleanup and remove event listeners │
 │ │
 │ Development Enhancements: │
 │ ├── Component debugging → Render timing and state inspection │
 │ ├── Event flow tracing → Debug event propagation │
 │ └── Performance profiling → Component-specific metrics │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ STATE MANAGEMENT SYSTEM │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ state/main-state.js → Central application state store │
 │ state/ui-state-manager.js → UI state and component coordination │
 │ state/data-persistence.js → Local storage and sync management │
 │ state/session-manager.js → Authentication and user session │
 │ │ │
 │ State Flow Pattern: │
 │ ├── Action Dispatch → User interaction triggers action │
 │ ├── State Mutation → Update central state store │
 │ ├── Component Notification → Notify subscribed components │
 │ ├── Re-render Trigger → Update affected UI components │
 │ └── Persistence Sync → Save to localStorage/API │
 │ │
 │ Development Features: │
 │ ├── State Time Travel → Undo/redo state changes │
 │ ├── State Change Logging → Track all state mutations │
 │ ├── State Inspector → Real-time state visualization │
 │ └── Hot State Reloading → Preserve state during development │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ API SERVICE LAYER │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ services/api/ → API communication layer │
 │ │ │
 │ ├── api-client.js → Base HTTP client with interceptors │
 │ ├── auth-api.js → Authentication endpoints │
 │ ├── todos-api.js → Todo CRUD operations │
 │ └── user-api.js → User profile and preferences │
 │ │
 │ API Features: │
 │ ├── Cookie-based Auth → Automatic session management │
 │ ├── Request Interceptors → Add auth headers and error handling │
 │ ├── Auto Retry Logic → Retry failed requests with backoff │
 │ ├── Request Caching → Cache GET requests for performance │
 │ └── Error Normalization → Consistent error handling │
 │ │
 │ Development Enhancements: │
 │ ├── Request/Response Logging → Detailed API call debugging │
 │ ├── Network Performance → Request timing and size metrics │
 │ ├── Mock API Support → Offline development mode │
 │ └── API Testing Tools → Endpoint testing and validation │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ STYLING ARCHITECTURE │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ CSS Architecture: │
 │ │ │
 │ ├── styles/base.css → CSS reset, base styles, typography │
 │ ├── styles/data-theme.css → CSS custom properties and theme system │
 │ ├── styles/main.css → Layout and component-specific styles │
 │ └── styles/components/ → Individual component stylesheets │
 │ │
 │ Theme System: │
 │ ├── Dark Mode Support → Complete dual theme implementation │
 │ ├── CSS Custom Properties → Dynamic theme switching │
 │ ├── Component Theming → Consistent styling patterns │
 │ └── Responsive Design → Mobile-first approach │
 │ │
 │ Development Tools: │
 │ ├── Live Style Editing → CSS hot reload without page refresh │
 │ ├── Style Inspector → Debug computed styles and theme variables │
 │ ├── CSS Performance → Track stylesheet loading and parsing │
 │ └── Experimental Styles → Test new design patterns │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ APPLICATION FLOW (Developer Mode) │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ 1⃣ App Initialization → app.js loads and initializes systems │
 │ │ │
 │ ├── Component Registry → Register all available components │
 │ ├── State Hydration → Load saved state from localStorage │
 │ ├── Session Validation → Check authentication status │
 │ └── Theme Application → Apply user's theme preferences │
 │ │
 │ 2⃣ Navigation & Routing → Page component management │
 │ │ │
 │ ├── Route Resolution → Determine active page component │
 │ ├── Component Mount → Initialize and render page component │
 │ ├── State Binding → Connect component to global state │
 │ └── Event Setup → Bind user interaction handlers │
 │ │
 │ 3⃣ User Interactions → Event handling and state updates │
 │ │ │
 │ ├── ⌨ User Input → Capture form data, clicks, keyboard │
 │ ├── Action Dispatch → Trigger state change actions │
 │ ├── API Calls → Communicate with backend services │
 │ └── UI Updates → Re-render affected components │
 │ │
 │ 4⃣ Data Persistence → Save state and sync with server │
 │ │ │
 │ ├── Local Storage → Save user preferences and offline data │
 │ ├── Server Sync → Upload changes to backend API │
 │ ├── Error Recovery → Handle sync failures gracefully │
 │ └── State Consistency → Ensure data integrity │
 │ │
 │ Development Additions: │
 │ ├── Flow Visualization → Real-time application flow debugging │
 │ ├── Performance Metrics → Track render times and memory usage │
 │ ├── Error Boundaries → Catch and report component errors │
 │ └── Hot Updates → Apply code changes without full page reload │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ DEVELOPMENT TOOLKIT │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ Development Scripts (package.json): │
 │ ├── npm run dev → Start development server with LiveReload │
 │ ├── npm run build → Build for production (if needed) │
 │ ├── npm run serve → Serve production build locally │
 │ ├── npm run test → Run frontend tests │
 │ └── npm run lint → Code quality checks │
 │ │
 │ Debugging Features: │
 │ ├── Debug Panel → Toggle-able development tools overlay │
 │ ├── Component Inspector → View component state and props │
 │ ├── State Timeline → Track state changes over time │
 │ ├── Network Monitor → API request/response inspection │
 │ └── Performance Panel → Render timing and memory usage │
 │ │
 │ Development Metrics: │
 │ ├── Component render times and frequency │
 │ ├── API request latency and success rates │
 │ ├── Memory usage and garbage collection │
 │ ├── CSS performance and paint metrics │
 │ └── PWA metrics and offline functionality │
 │ │
 │ Experimental Features: │
 │ ├── Hot Module Replacement without build tools │
 │ ├── Runtime CSS editing and theme customization │
 │ ├── A/B testing framework for UI variations │
 │ ├── Advanced performance profiling │
 │ └── Advanced debugging and introspection tools │
 │ │
 │ PWA Development: │
 │ ├── Service Worker debugging and testing │
 │ ├── Offline functionality development │
 │ ├── Background sync testing │
 │ └── PWA performance metrics │
 └─────────────────────────────────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ KEY DEVELOPMENT PATTERNS │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ │
 │ Component Pattern → ES6 class-based component architecture │
 │ State Management Pattern → Subscribe/dispatch pattern for state updates │
 │ API Pattern → Async/await with consistent error handling │
 │ │
 │ See code examples below for detailed implementation patterns │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

## Development Patterns & Code Examples

### Component Pattern

ES6 class-based component architecture with lifecycle management:

```javascript
class MyComponent {
  constructor(props = {}) {
    this.props = props;
    this.state = this.getInitialState();
  }

  render() {
    return `<div class="my-component">${this.props.content}</div>`;
  }

  mount(container) {
    container.innerHTML = this.render();
    this.bindEvents();
  }

  update(newProps) {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  destroy() {
    // Cleanup event listeners and references
    this.removeEventListeners();
  }
}
```

### State Management Pattern

Subscribe/dispatch pattern for reactive state updates:

```javascript
// Subscribe to state changes
state.subscribe("todos", (newTodos) => {
  this.updateTodoList(newTodos);
});

// Dispatch state actions
state.dispatch("ADD_TODO", {
  text: "New todo",
  completed: false,
});

// State with middleware support
state.use("persistence", persistenceMiddleware);
state.use("logging", loggingMiddleware);
```

### API Pattern

Async/await with consistent error handling and retry logic:

```javascript
// Async API calls with error handling
const result = await api.todos.create({
  text: "New todo",
  completed: false,
});

if (result.success) {
  state.dispatch("ADD_TODO", result.data);
  ui.showSuccess("Todo created successfully");
} else {
  ui.showError(result.error);
  // Optionally retry or queue for later
}

// API client with interceptors
api.interceptors.request.use((config) => {
  config.headers["X-Request-ID"] = generateRequestId();
  return config;
});
```

### Theme System Pattern

Dynamic theme switching with CSS custom properties:

```javascript
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem("theme") || "light";
    this.applyTheme(this.currentTheme);
  }

  applyTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
    this.currentTheme = themeName;
    localStorage.setItem("theme", themeName);

    // Notify components of theme change
    state.dispatch("THEME_CHANGED", { theme: themeName });
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
  }
}
```
