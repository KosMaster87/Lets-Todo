/**
 * @fileoverview Personal Data Download Service
 * @module personal-data-download
 */

import { getTodos, getTrashedTodos } from "./../../state/main-state.js";

/**
 * Supported export formats
 */
export const EXPORT_FORMATS = {
  JSON: "json",
  CSV: "csv",
  TXT: "txt",
};

/**
 * Gets current timestamp for filename
 * @returns {string} Formatted timestamp
 */
export const getTimestamp = () => {
  const now = new Date();
  return (
    now.toISOString().split("T")[0] +
    "_" +
    now.toTimeString().split(" ")[0].replace(/:/g, "-")
  );
};

/**
 * Converts todos to JSON format
 * @param {Array} todos - Array of active todo objects
 * @param {Array} trashedTodos - Array of trashed todo objects
 * @returns {string} JSON string
 */
export const todosToJSON = (todos, trashedTodos) => {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalTodos: todos.length + trashedTodos.length,
    activeTodos: todos.length,
    trashedTodos: trashedTodos.length,
    todos: todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      content: todo.content,
      completed: todo.completed,
      bookmarked: todo.bookmarked,
      created: todo.created,
      lastModified: todo.lastModified,
      deletedAt: null,
      status: "active",
    })),
    trash: trashedTodos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      content: todo.content,
      completed: todo.completed,
      bookmarked: todo.bookmarked,
      created: todo.created,
      lastModified: todo.lastModified,
      deletedAt: todo.deletedAt,
      status: "trashed",
    })),
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Converts todos to CSV format
 * @param {Array} todos - Array of active todo objects
 * @param {Array} trashedTodos - Array of trashed todo objects
 * @returns {string} CSV string
 */
export const todosToCSV = (todos, trashedTodos) => {
  const headers = [
    "ID",
    "Title",
    "Content",
    "Completed",
    "Bookmarked",
    "Created",
    "LastModified",
    "DeletedAt",
    "Status",
  ];

  const csvRows = [headers.join(",")];

  // Add active todos
  todos.forEach((todo) => {
    const row = [
      todo.id,
      `"${(todo.title || "").replace(/"/g, '""')}"`,
      `"${(todo.content || "").replace(/"/g, '""')}"`,
      todo.completed ? "Yes" : "No",
      todo.bookmarked ? "Yes" : "No",
      todo.created ? new Date(todo.created).toISOString() : "",
      todo.lastModified || "",
      "",
      "Active",
    ];
    csvRows.push(row.join(","));
  });

  // Add trashed todos
  trashedTodos.forEach((todo) => {
    const row = [
      todo.id,
      `"${(todo.title || "").replace(/"/g, '""')}"`,
      `"${(todo.content || "").replace(/"/g, '""')}"`,
      todo.completed ? "Yes" : "No",
      todo.bookmarked ? "Yes" : "No",
      todo.created ? new Date(todo.created).toISOString() : "",
      todo.lastModified || "",
      todo.deletedAt || "",
      "Trashed",
    ];
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
};

/**
 * Converts todos to plain text format
 * @param {Array} todos - Array of active todo objects
 * @param {Array} trashedTodos - Array of trashed todo objects
 * @returns {string} Text string
 */
export const todosToText = (todos, trashedTodos) => {
  const totalCount = todos.length + trashedTodos.length;
  const lines = [
    "=".repeat(60),
    `TODOS EXPORT - ${new Date().toLocaleString()}`,
    `Total Todos: ${totalCount} (${todos.length} aktiv, ${trashedTodos.length} im Papierkorb)`,
    "=".repeat(60),
    "",
  ];

  // Active todos section
  if (todos.length > 0) {
    lines.push("📝 AKTIVE TODOS");
    lines.push("-".repeat(30));
    lines.push("");

    todos.forEach((todo, index) => {
      lines.push(`${index + 1}. ${todo.title || "Untitled"}`);
      lines.push(`   Status: ${todo.completed ? "✅ Erledigt" : "⏳ Offen"}`);
      lines.push(`   Bookmark: ${todo.bookmarked ? "⭐ Ja" : "Nein"}`);
      lines.push(
        `   Erstellt: ${
          todo.created ? new Date(todo.created).toLocaleString() : "Unbekannt"
        }`
      );

      if (todo.content) {
        lines.push(`   Inhalt:`);
        lines.push(`   ${todo.content.replace(/\n/g, "\n   ")}`);
      }
      lines.push("");
    });
  }

  // Trashed todos section
  if (trashedTodos.length > 0) {
    lines.push("🗑️ PAPIERKORB");
    lines.push("-".repeat(30));
    lines.push("");

    trashedTodos.forEach((todo, index) => {
      lines.push(`${index + 1}. ${todo.title || "Untitled"} [GELÖSCHT]`);
      lines.push(`   Status: ${todo.completed ? "✅ Erledigt" : "⏳ Offen"}`);
      lines.push(`   Bookmark: ${todo.bookmarked ? "⭐ Ja" : "Nein"}`);
      lines.push(
        `   Erstellt: ${
          todo.created ? new Date(todo.created).toLocaleString() : "Unbekannt"
        }`
      );
      lines.push(
        `   Gelöscht: ${
          todo.deletedAt
            ? new Date(todo.deletedAt).toLocaleString()
            : "Unbekannt"
        }`
      );

      if (todo.content) {
        lines.push(`   Inhalt:`);
        lines.push(`   ${todo.content.replace(/\n/g, "\n   ")}`);
      }
      lines.push("");
    });
  }

  return lines.join("\n");
};

/**
 * Creates and triggers download of a file
 * @param {string} content - File content
 * @param {string} filename - Name of the file
 * @param {string} mimeType - MIME type of the file
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

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Generates filename based on format
 * @param {string} format - Export format
 * @returns {string} Generated filename
 */
export const generateFilename = (format) => {
  const timestamp = getTimestamp();
  return `todos_export_${timestamp}.${format}`;
};

/**
 * Gets MIME type for format
 * @param {string} format - Export format
 * @returns {string} MIME type
 */
export const getMimeType = (format) => {
  switch (format) {
    case EXPORT_FORMATS.JSON:
      return "application/json";
    case EXPORT_FORMATS.CSV:
      return "text/csv";
    case EXPORT_FORMATS.TXT:
      return "text/plain";
    default:
      return "text/plain";
  }
};

/**
 * Downloads todos in specified format
 * @param {string} format - Export format (json, csv, txt)
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const downloadTodos = (format, onSuccess, onError) => {
  try {
    const todos = getTodos();
    const trashedTodos = getTrashedTodos();
    const totalCount = todos.length + trashedTodos.length;

    if (totalCount === 0) {
      onError?.("Keine Todos zum Exportieren vorhanden.");
      return;
    }

    let content;
    switch (format) {
      case EXPORT_FORMATS.JSON:
        content = todosToJSON(todos, trashedTodos);
        break;
      case EXPORT_FORMATS.CSV:
        content = todosToCSV(todos, trashedTodos);
        break;
      case EXPORT_FORMATS.TXT:
        content = todosToText(todos, trashedTodos);
        break;
      default:
        onError?.(`Unbekanntes Export-Format: ${format}`);
        return;
    }

    const filename = generateFilename(format);
    const mimeType = getMimeType(format);

    triggerDownload(content, filename, mimeType);

    onSuccess?.(
      `${totalCount} Todos (${todos.length} aktiv, ${
        trashedTodos.length
      } gelöscht) erfolgreich als ${format.toUpperCase()} exportiert: ${filename}`
    );
  } catch (error) {
    console.error("Download error:", error);
    onError?.("Fehler beim Exportieren der Todos.");
  }
};
