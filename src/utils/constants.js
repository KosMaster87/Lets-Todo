// lets-todo-app/src/utils/constants.js

/**
 * Available views of the Let's Todo application
 * @type {Object}
 */
export const VIEWS = {
  MAIN_MENU: "main-menu",
  REGISTER: "register",
  LOGIN: "login",
  DASHBOARD: "dashboard",
  NOTES_LIST: "notes-list",
  NOTES: "notes",
  NOTE_VIEW: "note-view",
  TRASH: "trash",
  OPTIONS: "options",
  PERSONAL_DATA: "personal-data",
  CHANGE_PASSWORD: "change-password",
};

/**
 * Page titles for each view
 * @type {Object}
 */
export const PAGE_TITLES = {
  [VIEWS.MAIN_MENU]: "Let's Todo - Start",
  [VIEWS.REGISTER]: "Let's Todo - Registrieren",
  [VIEWS.LOGIN]: "Let's Todo - Anmelden",
  [VIEWS.DASHBOARD]: "Let's Todo - Dashboard",
  [VIEWS.NOTES_LIST]: "Let's Todo - Notizen",
  [VIEWS.NOTES]: "Let's Todo - Neue Notiz",
  [VIEWS.NOTE_VIEW]: "Let's Todo - Notiz bearbeiten",
  [VIEWS.TRASH]: "Let's Todo - Papierkorb",
  [VIEWS.OPTIONS]: "Let's Todo - Einstellungen",
  [VIEWS.PERSONAL_DATA]: "Let's Todo - Persönliche Daten",
  [VIEWS.CHANGE_PASSWORD]: "Let's Todo - Passwort ändern",
};

/**
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
 * Session types
 * @type {Object}
 */
export const SESSION_TYPES = {
  GUEST: "guest",
  USER: "user",
};

/**
 * Theme options
 * @type {Object}
 */
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
};

/**
 * Language options
 * @type {Object}
 */
export const LANGUAGES = {
  DE: "de",
  EN: "en",
};
