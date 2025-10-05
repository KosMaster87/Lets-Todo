// lets-todo-app/src/app.js

import {
  initializeStoredData,
  addTodo,
  getTodos,
  getTrashedTodos,
  setTrashedTodos,
  addListener,
  getSessionType,
} from "./state.js";
import { renderMainContent } from "./components/main-content.js";
import { initializeAllSampleData } from "./utils/sample-data.js";
import {
  initializeNavigation,
  setupNavigationListeners,
} from "./services/navigation/navigation.js";

/**
 * Initializes the entire Let's Todo application:
 * Loads stored data, sets up user preferences, theme system, session status,
 * navigation, state listeners, renders all components,
 * and enables scroll management.
 */
const initializeApp = () => {
  registerStateListeners();
  initializeStoredData();

  const currentTodos = getTodos();
  const currentTrashedTodos = getTrashedTodos();
  const sessionType = getSessionType();

  if (sessionType !== "user") {
    initializeAllSampleData(
      addTodo,
      setTrashedTodos,
      currentTodos,
      currentTrashedTodos
    );
  } else {
    // console.log(
    //   `👤 User session detected - skipping sample data initialization`
    // );
  }

  initializeNavigation();
};

/**
 * Registers all state listeners for automatic UI updates.
 * Uses the clean listener API instead of direct array manipulation.
 */
const registerStateListeners = () => {
  // console.log("📝 Registering state listeners using clean API");
  addListener(renderAllComponents);
  // console.log("✅ Main render listener registered");
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
