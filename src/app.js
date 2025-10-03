// lets-todo-app/src/app.js

import {
  initializeStoredData,
  addTodo,
  getTodos,
  getTrashedTodos,
  setTrashedTodos,
  addListener,
  removeListener,
} from "./state.js";
import { renderMainContent } from "./components/main-content.js";
import { initializeAllSampleData } from "./utils/sample-data.js";
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
  // 1. Register listeners FIRST (so they receive notifications)
  registerStateListeners();

  // 2. Load stored data AFTER listeners are registered
  initializeStoredData();

  // 3. Add sample data if no todos exist
  const currentTodos = getTodos();
  const currentTrashedTodos = getTrashedTodos();

  initializeAllSampleData(
    addTodo,
    setTrashedTodos,
    currentTodos,
    currentTrashedTodos
  );

  // 4. Initialize navigation
  initializeNavigation();
  // ScrollManager.init();
};

/**
 * Registers all state listeners for automatic UI updates.
 * Uses the clean listener API instead of direct array manipulation.
 */
const registerStateListeners = () => {
  console.log("📝 Registering state listeners using clean API");
  addListener(renderAllComponents);
  console.log("✅ Main render listener registered");
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
};

/**
 * Starts the application after the DOM has loaded.
 */
document.addEventListener("DOMContentLoaded", initializeApp);
