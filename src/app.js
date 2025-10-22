/**
 * @fileoverview Main application initializer for Let's Todo App
 * @module app
 */

import {
  initializeStoredData,
  addTodo,
  getTodos,
  getTrashedTodos,
  setTrashedTodos,
  addListener,
  getSessionType,
  getUserPreferences,
} from "./state/main-state.js";
import { renderMainContent } from "./components/main-content.js";
import { initializeAllSampleData } from "./utils/sample-data.js";
import {
  initializeNavigation,
  setupNavigationListeners,
} from "./services/navigation/navigation.js";

/**
 * Initializes the entire Let's Todo application with async API sync support:
 * Loads stored data, sets up user preferences, theme system, session status,
 * navigation, state listeners, renders all components,
 * and enables scroll management.
 */
const initializeApp = async () => {
  registerStateListeners();
  initializeTheme();
  await initializeStoredData();

  const currentTodos = getTodos();
  const currentTrashedTodos = getTrashedTodos();
  const sessionType = getSessionType();

  initializeSampleDataIfNeeded(sessionType, currentTodos, currentTrashedTodos);
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
  renderMainContent(window.currentUrlParams);
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
 * Initializes the theme system by loading saved theme preference.
 * First paint setup for consistent theming using same storage as AppInitializer.
 */
const initializeTheme = () => {
  try {
    const preferences = getUserPreferences();
    const savedTheme = preferences?.theme || "light";
    document.body.setAttribute("data-theme", savedTheme);
    console.log(`Theme initialized: ${savedTheme}`);
  } catch (error) {
    console.error("Failed to load theme preference:", error);
    document.body.setAttribute("data-theme", "light");
  }
};

/**
 * Initializes sample data for guest sessions only
 * User sessions skip sample data initialization to preserve user data
 * @param {string} sessionType - Current session type ('user' or 'guest')
 * @param {Array} currentTodos - Current todos array
 * @param {Array} currentTrashedTodos - Current trashed todos array
 */
const initializeSampleDataIfNeeded = (
  sessionType,
  currentTodos,
  currentTrashedTodos
) => {
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
};

/**
 * Starts the application after the DOM has loaded.
 */
document.addEventListener("DOMContentLoaded", initializeApp);
