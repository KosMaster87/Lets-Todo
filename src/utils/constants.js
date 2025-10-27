/**
 * @fileoverview Application-wide constants
 * @module constants
 */

/**
 * Available views of the Let's Todo application
 * @type {Object}
 */
export const VIEWS = {
  MAIN_MENU: "main-menu",
  REGISTER: "register",
  LOGIN: "login",
  DASHBOARD: "dashboard",
  TODOS_LIST: "todos-list",
  TODOS: "todos",
  TODO_VIEW: "todo-view",
  TRASH: "trash",
  OPTIONS: "options",
  PERSONAL_DATA: "personal-data",
  CHANGE_PASSWORD: "change-password",
  RESET_PASSWORD: "reset-password",
  RESET_PASSWORD_CONFIRM: "reset-password-confirm",
  IMPRINT: "imprint",
};

/**
 * Page titles for each view
 * @type {Object}
 */
export const PAGE_TITLES = {
  [VIEWS.MAIN_MENU]: "Let's Todo - Home",
  [VIEWS.REGISTER]: "Let's Todo - Register",
  [VIEWS.LOGIN]: "Let's Todo - Login",
  [VIEWS.DASHBOARD]: "Let's Todo - Dashboard",
  [VIEWS.TODOS_LIST]: "Let's Todo - Todos",
  [VIEWS.TODOS]: "Let's Todo - New Todo",
  [VIEWS.TODO_VIEW]: "Let's Todo - Edit Todo",
  [VIEWS.TRASH]: "Let's Todo - Trash",
  [VIEWS.OPTIONS]: "Let's Todo - Settings",
  [VIEWS.PERSONAL_DATA]: "Let's Todo - Personal Data",
  [VIEWS.CHANGE_PASSWORD]: "Let's Todo - Change Password",
  [VIEWS.RESET_PASSWORD]: "Let's Todo - Reset Password",
  [VIEWS.RESET_PASSWORD_CONFIRM]: "Let's Todo - Set New Password",
  [VIEWS.IMPRINT]: "Let's Todo - Imprint",
};

/**
 * Debug mode flag for development logging
 * @type {boolean}
 */
export const DEBUG_MODE = true;

/**
 * Session types
 * @type {Object}
 */
export const SESSION_TYPES = {
  GUEST: "guest",
  USER: "user",
};

/**
 * TODO: Update base URL as needed
 * API endpoints
 * @type {Object}
 */
export const API_ENDPOINTS = {
  BASE_URL: "https://lets-todo-api.dev2k.org/api",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    CHECK_SESSION: "/auth/check-session",
  },
  TODOS: {
    GET_ALL: "/todos",
    CREATE: "/todos",
    UPDATE: "/todos",
    DELETE: "/todos",
  },
  USER: {
    PROFILE: "/user/profile",
    CHANGE_PASSWORD: "/user/change-password",
    DELETE_ACCOUNT: "/user/delete-account",
  },
};

/**
 * TODO: Update base URL as needed
 * Local storage keys
 * @type {Object}
 */
export const STORAGE_KEYS = {
  SESSION: "todoapp-session",
  TODOS: "todoapp-todos",
  TRASH: "todoapp-trash",
  PREFERENCES: "todoapp-preferences",
};

/**
 * TODO: Update base URL as needed
 * Notification types
 * @type {Object}
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

/**
 * TODO: Update base URL as needed
 * Theme options
 * @type {Object}
 */
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
};

/**
 * TODO: Update base URL as needed
 * Language options
 * @type {Object}
 */
export const LANGUAGES = {
  DE: "de",
  EN: "en",
};
