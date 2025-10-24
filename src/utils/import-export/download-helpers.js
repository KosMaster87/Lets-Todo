/**
 * @fileoverview Download and Export Utilities
 * @module download-helpers
 */

/**
 * Gets current timestamp formatted for filename usage
 * @returns {string} Formatted timestamp in YYYY-MM-DD_HH-MM-SS format
 */
export const getTimestamp = () => {
  const now = new Date();
  const datePart = now.toISOString().split("T")[0];
  const timePart = now.toTimeString().split(" ")[0].replace(/:/g, "-");
  return `${datePart}_${timePart}`;
};

/**
 * Creates and triggers download of a file
 * @param {string} content - File content
 * @param {string} filename - Name of the file
 * @param {string} mimeType - MIME type of the file
 * @returns {void}
 */
export const triggerDownload = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Generates JSON filename with timestamp
 * @param {string} prefix - Filename prefix
 * @returns {string} Generated filename
 */
export const generateJSONFilename = (prefix = "export") => {
  const timestamp = getTimestamp();
  return `${prefix}_${timestamp}.json`;
};

/**
 * Creates export metadata for todos
 * @param {Array} todos - Array of active todo objects
 * @param {Array} trashedTodos - Array of trashed todo objects
 * @returns {Object} Export metadata object
 */
export const createExportMetadata = (todos, trashedTodos) => ({
  exportDate: new Date().toISOString(),
  totalTodos: todos.length + trashedTodos.length,
  activeTodos: todos.length,
  trashedTodos: trashedTodos.length,
});

/**
 * Formats a single todo for export
 * @param {Object} todo - Todo object
 * @param {string} status - Todo status ("active" or "trashed")
 * @returns {Object} Formatted todo object
 */
export const formatTodoForExport = (todo, status) => ({
  id: todo.id,
  title: todo.title,
  content: todo.content,
  completed: todo.completed,
  bookmarked: todo.bookmarked,
  created: todo.created,
  lastModified: todo.lastModified,
  deletedAt: status === "trashed" ? todo.deletedAt : null,
  status,
});

/**
 * Converts todos to JSON format
 * @param {Array} todos - Array of active todo objects
 * @param {Array} trashedTodos - Array of trashed todo objects
 * @returns {string} JSON string
 */
export const todosToJSON = (todos, trashedTodos) => {
  const metadata = createExportMetadata(todos, trashedTodos);
  const activeTodos = todos.map((todo) => formatTodoForExport(todo, "active"));
  const trashedItems = trashedTodos.map((todo) =>
    formatTodoForExport(todo, "trashed")
  );

  const exportData = {
    ...metadata,
    todos: activeTodos,
    trash: trashedItems,
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Creates success message for export
 * @param {number} totalCount - Total todos exported
 * @param {number} activeCount - Active todos count
 * @param {number} trashedCount - Trashed todos count
 * @param {string} filename - Export filename
 * @returns {string} Success message
 */
export const createExportSuccessMessage = (
  totalCount,
  activeCount,
  trashedCount,
  filename
) =>
  `${totalCount} todos (${activeCount} active, ${trashedCount} trashed) exported as JSON: ${filename}`;

/**
 * Validates if todos exist for export
 * @param {number} totalCount - Total number of todos
 * @returns {Object} Validation result
 */
export const validateTodosForExport = (totalCount) => {
  if (totalCount === 0) {
    return {
      isValid: false,
      error: "No todos available for export.",
    };
  }
  return { isValid: true };
};
