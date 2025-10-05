// lets-todo-app/src/services/crud/personal-data-upload.js

import {
  addTodo,
  getTodos,
  getTrashedTodos,
  trashTodo,
} from "./../../state.js";

/**
 * Supported import formats
 */
export const IMPORT_FORMATS = {
  JSON: "json",
  CSV: "csv",
};

/**
 * Import result types
 */
export const IMPORT_RESULT_TYPES = {
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

/**
 * Validates if a file is a supported format
 * @param {File} file - File object to validate
 * @returns {Object} Validation result with isValid and format
 */
export const validateFileFormat = (file) => {
  if (!file) {
    return { isValid: false, error: "Keine Datei ausgewählt." };
  }

  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".json")) {
    return { isValid: true, format: IMPORT_FORMATS.JSON };
  }

  if (fileName.endsWith(".csv")) {
    return { isValid: true, format: IMPORT_FORMATS.CSV };
  }

  return {
    isValid: false,
    error: `Nicht unterstütztes Dateiformat. Unterstützt: JSON, CSV`,
  };
};

/**
 * Reads file content as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File content
 */
export const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) =>
      reject(new Error("Datei konnte nicht gelesen werden"));

    reader.readAsText(file);
  });
};

/**
 * Parses JSON import file
 * @param {string} content - File content
 * @returns {Object} Parsed todos with metadata
 */
export const parseJSONImport = (content) => {
  try {
    const data = JSON.parse(content);

    // Handle new export format with separate todos/trash
    if (data.todos && Array.isArray(data.todos)) {
      const activeTodos = data.todos || [];
      const trashedTodos = data.trash || [];

      return {
        success: true,
        activeTodos: activeTodos.map(normalizeTodoObject),
        trashedTodos: trashedTodos.map(normalizeTodoObject),
        totalCount: activeTodos.length + trashedTodos.length,
        metadata: {
          exportDate: data.exportDate,
          originalActiveTodos: data.activeTodos || activeTodos.length,
          originalTrashedTodos: data.trashedTodos || trashedTodos.length,
        },
      };
    }

    // Handle legacy format (array of todos)
    if (Array.isArray(data)) {
      const todos = data.map(normalizeTodoObject);
      return {
        success: true,
        activeTodos: todos.filter((todo) => !todo.deletedAt),
        trashedTodos: todos.filter((todo) => todo.deletedAt),
        totalCount: todos.length,
        metadata: { format: "legacy" },
      };
    }

    return {
      success: false,
      error: "Unbekanntes JSON-Format",
    };
  } catch (error) {
    return {
      success: false,
      error: `JSON-Parsing Fehler: ${error.message}`,
    };
  }
};

/**
 * Parses CSV import file
 * @param {string} content - CSV content
 * @returns {Object} Parsed todos with metadata
 */
export const parseCSVImport = (content) => {
  try {
    const lines = content.trim().split("\n");
    if (lines.length < 2) {
      return {
        success: false,
        error: "CSV-Datei ist leer oder ungültig",
      };
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const todos = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const todoObj = {};
      headers.forEach((header, index) => {
        todoObj[header.toLowerCase()] = values[index];
      });

      todos.push(normalizeCSVTodo(todoObj));
    }

    const activeTodos = todos.filter((todo) => !todo.deletedAt);
    const trashedTodos = todos.filter((todo) => todo.deletedAt);

    return {
      success: true,
      activeTodos,
      trashedTodos,
      totalCount: todos.length,
      metadata: { format: "csv" },
    };
  } catch (error) {
    return {
      success: false,
      error: `CSV-Parsing Fehler: ${error.message}`,
    };
  }
};

/**
 * Ensures string value from potentially corrupted data
 * @param {*} value - Value to fix
 * @returns {string} Cleaned string
 */
export const ensureString = (value) => {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join("");
  }
  if (typeof value === "object" && value !== null) {
    return Object.values(value).join("");
  }
  return String(value || "");
};

/**
 * Normalizes todo object to ensure required fields
 * @param {Object} todo - Raw todo object
 * @returns {Object} Normalized todo object
 */
export const normalizeTodoObject = (todo) => {
  // Ensure we have a valid todo object
  if (!todo || typeof todo !== "object") {
    console.warn("Invalid todo object:", todo);
    return {
      id: generateTempId(),
      title: "Importiertes Todo",
      content: "",
      completed: false,
      bookmarked: false,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      deletedAt: null,
    };
  }

  // Fix corrupted title/content (array-like objects)
  const title = ensureString(todo.title).trim() || "Importiertes Todo";
  const content = ensureString(todo.content).trim();

  return {
    id: todo.id || generateTempId(),
    title: title,
    content: content,
    completed: Boolean(todo.completed),
    bookmarked: Boolean(todo.bookmarked),
    created: todo.created || new Date().toISOString(),
    lastModified: todo.lastModified || new Date().toISOString(),
    deletedAt: todo.deletedAt || null,
  };
};

/**
 * Normalizes CSV todo object
 * @param {Object} csvTodo - CSV parsed todo
 * @returns {Object} Normalized todo
 */
export const normalizeCSVTodo = (csvTodo) => ({
  id: csvTodo.id || generateTempId(),
  title: ensureString(csvTodo.title).trim() || "Importiertes Todo",
  content: ensureString(csvTodo.content).trim(),
  completed: csvTodo.completed === "Yes" || csvTodo.completed === "true",
  bookmarked: csvTodo.bookmarked === "Yes" || csvTodo.bookmarked === "true",
  created: csvTodo.created || new Date().toISOString(),
  lastModified: csvTodo.lastmodified || new Date().toISOString(),
  deletedAt: csvTodo.deletedat || null,
});

/**
 * Parses CSV line handling quoted values
 * @param {string} line - CSV line
 * @returns {Array} Parsed values
 */
export const parseCSVLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result.map((val) => val.replace(/^"|"$/g, ""));
};

/**
 * Generates temporary ID for imported todos
 * @returns {string} Temporary ID
 */
export const generateTempId = () => {
  return `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Checks for duplicate todos
 * @param {Array} importedTodos - Todos to import
 * @param {Array} existingTodos - Existing todos
 * @returns {Object} Duplicates analysis
 */
export const findDuplicates = (importedTodos, existingTodos) => {
  const duplicates = [];
  const unique = [];

  importedTodos.forEach((importedTodo) => {
    const isDuplicate = existingTodos.some(
      (existing) =>
        existing.title === importedTodo.title &&
        existing.content === importedTodo.content
    );

    if (isDuplicate) {
      duplicates.push(importedTodo);
    } else {
      unique.push(importedTodo);
    }
  });

  return { duplicates, unique };
};

/**
 * Imports active todos into the system
 * @param {Array} activeTodos - Active todos to import
 * @param {Object} options - Import options
 * @returns {Object} Import result
 */
export const importActiveTodos = (activeTodos, options = {}) => {
  const existingTodos = getTodos();
  const { duplicates, unique } = findDuplicates(activeTodos, existingTodos);

  let imported = 0;
  const errors = [];

  const todosToImport = options.allowDuplicates ? activeTodos : unique;

  todosToImport.forEach((todo) => {
    try {
      console.log(`🔍 Raw active todo object:`, todo);

      // Fix potentially corrupted title/content
      const title = ensureString(todo.title).trim() || "Importiertes Todo";
      const content = ensureString(todo.content).trim();

      console.log(`🔍 Fixed title: "${title}", content: "${content}"`);

      if (!title) {
        errors.push(`Todo ohne Titel übersprungen`);
        return;
      }

      console.log(`📥 Importing active todo: "${title}"`);
      const todoObject = {
        title: title,
        content: content,
        completed: Boolean(todo.completed),
        bookmarked: Boolean(todo.bookmarked),
      };

      console.log(`🔍 Final todo object for addTodo:`, todoObject);
      addTodo(todoObject);
      imported++;
    } catch (error) {
      console.error(`Error importing active todo:`, error);
      errors.push(
        `Fehler beim Importieren: ${
          ensureString(todo.title) || "Unbekanntes Todo"
        } - ${error.message}`
      );
    }
  });

  return {
    imported,
    duplicatesFound: duplicates.length,
    errors,
    skipped: options.allowDuplicates ? 0 : duplicates.length,
  };
};

/**
 * Imports trashed todos into the system
 * Note: This is complex because we need to create todos first, then move them to trash
 * @param {Array} trashedTodos - Trashed todos to import
 * @param {Object} options - Import options
 * @returns {Object} Import result
 */
export const importTrashedTodos = async (trashedTodos, options = {}) => {
  const existingTrashedTodos = getTrashedTodos();
  const { duplicates, unique } = findDuplicates(
    trashedTodos,
    existingTrashedTodos
  );

  let imported = 0;
  const errors = [];

  const todosToImport = options.allowDuplicates ? trashedTodos : unique;

  for (const todo of todosToImport) {
    try {
      // Fix potentially corrupted title/content
      const title = ensureString(todo.title).trim() || "Importiertes Todo";
      const content = ensureString(todo.content).trim();

      if (!title) {
        errors.push(`Todo ohne Titel übersprungen`);
        continue;
      }

      console.log(`📥 Importing trash todo: "${title}"`);
      const todoObject = {
        title: title,
        content: content,
        completed: Boolean(todo.completed),
        bookmarked: Boolean(todo.bookmarked),
      }; // Step 1: Create todo as active first
      addTodo(todoObject);

      // Step 2: Find the just-created todo by matching title and content
      // We need a small delay to ensure the todo is fully created
      await new Promise((resolve) => setTimeout(resolve, 10));

      const currentTodos = getTodos();
      const createdTodo = currentTodos.find(
        (t) =>
          t.title === title &&
          t.content === content &&
          t.completed === Boolean(todo.completed) &&
          t.bookmarked === Boolean(todo.bookmarked)
      );

      if (createdTodo) {
        console.log(`🗑️ Moving to trash: ID ${createdTodo.id}`);
        // Step 3: Move to trash using the actual created ID
        await trashTodo(createdTodo.id);
        imported++;
      } else {
        errors.push(
          `Todo "${title}" wurde erstellt, konnte aber nicht gefunden werden für Trash-Verschiebung`
        );
      }
    } catch (error) {
      console.error(`Error importing trash todo:`, error);
      errors.push(
        `Fehler beim Importieren: ${
          ensureString(todo.title) || "Unbekanntes Todo"
        } - ${error.message}`
      );
    }
  }

  return {
    imported,
    duplicatesFound: duplicates.length,
    errors,
    skipped: options.allowDuplicates ? 0 : duplicates.length,
  };
};
