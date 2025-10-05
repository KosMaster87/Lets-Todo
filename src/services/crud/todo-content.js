// lets-todo-app/src/services/crud/todo-content.js

/**
 * Gets todo content from DOM elements
 * @returns {Object|null} Content object with elements and values, or null if elements not found
 */
export const getTodoContentFromDOM = () => {
  const titleElement = document.getElementById("todoDisplayTitle");
  const contentElement = document.getElementById("todoContentDisplay");

  if (!titleElement || !contentElement) {
    return null;
  }

  return {
    titleElement,
    contentElement,
    title: titleElement.textContent.trim(),
    content: contentElement.textContent.trim(),
  };
};

/**
 * Gets current content for action button handlers
 * @returns {Object} Object with title and content
 */
export const getContentForActions = () => {
  const titleElement = document.querySelector("#todoDisplayTitle");
  const contentElement = document.querySelector("#todoContentDisplay");

  const title = titleElement ? titleElement.textContent.trim() : "";
  const content = contentElement ? contentElement.textContent.trim() : "";

  console.log("getContentForActions called:", {
    title,
    content,
    titleElement,
    contentElement,
  });

  return { title, content };
};

/**
 * Clears todo content for delete action
 */
export const clearTodoContent = () => {
  const titleElement = document.querySelector("#todoDisplayTitle");
  const contentElement = document.querySelector("#todoContentDisplay");

  if (titleElement) titleElement.textContent = "Neue Todo";
  if (contentElement) contentElement.textContent = "";
};
