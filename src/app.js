// lets-todo-app/src/app.js

import {
  appState,
  loadAllStoredData,
  addTodo,
  getTodos,
  getTrashedTodos,
  setTrashedTodos,
} from "./state.js";
import { renderMainContent } from "./components/main-content.js";
import { initializeAllSampleData } from "./utils/sample-data.js";
// import { initializeTodoEvents } from "./services/todo-events.js";
// import { initializeUserPreferences } from "./services/user-preferences.js";
// import { initializeThemeSystem } from "./services/theme-system.js";
// import { initializeSessionStatus } from "./services/session.js";
// import { initializeSettingsEvents } from "./services/settings-events.js";
import {
  initializeNavigation,
  setupNavigationListeners,
} from "./services/navigation.js";
// import { ScrollManager } from "./utils/scroll-manager.js";

/**
 * Initializes the entire Let's Todo application:
 * Loads stored data, sets up user preferences, theme system, session status,
 * navigation, state listeners, renders all components,
 * and enables scroll management.
 */
const initializeApp = () => {
  loadAllStoredData();

  // Add sample data if no todos exist
  const currentTodos = getTodos();
  const currentTrashedTodos = getTrashedTodos();

  initializeAllSampleData(
    addTodo,
    setTrashedTodos,
    currentTodos,
    currentTrashedTodos
  );

  // initializeUserPreferences();
  // initializeThemeSystem();
  // initializeSessionStatus();
  initializeNavigation();
  registerStateListeners();
  renderAllComponents();
  // ScrollManager.init(appState);
};

/**
 * Registers all state listeners for automatic UI updates.
 * Adds the main render function to the appState listeners array.
 */
const registerStateListeners = () => {
  appState.listeners.push(renderAllComponents);
};

/**
 * Renders all main components of the application:
 * Main content, and sets up component-specific event listeners.
 */
const renderAllComponents = () => {
  renderMainContent();
  setupComponentEventListeners();
};

/**
 * Sets up event listeners that need to be re-initialized on each re-render.
 * Includes navigation navigation, todos, session, and settings event handlers.
 */
const setupComponentEventListeners = () => {
  setupNavigationListeners();
  // initializeTodoEvents();
  // initializeSessionEvents();
  // initializeSettingsEvents();
};

/**
 * Starts the application after the DOM has loaded.
 */
document.addEventListener("DOMContentLoaded", initializeApp);
