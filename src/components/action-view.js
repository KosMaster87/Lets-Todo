/**
 * @fileoverview Action View Component
 * @module action-view
 */

/**
 * Renders action buttons for a todo item
 * @param {Object} options - Configuration options for the action buttons
 * @param {string} options.todoId - Todo ID (used for dynamic IDs in lists)
 * @param {boolean} options.isBookmarked - Whether the todo is bookmarked
 * @param {boolean} options.isCompleted - Whether the todo is completed
 * @param {boolean} options.useDynamicIds - Whether to use dynamic IDs (for lists)
 * @param {string} options.context - Context: 'list', 'create', 'edit'
 * @returns {string} HTML string for action buttons
 */
export const renderActionButtons = (options = {}) => {
  const {
    todoId = "",
    isBookmarked = false,
    isCompleted = false,
    useDynamicIds = false,
    context = "single",
  } = options;

  // Generate IDs based on context
  const getButtonId = (baseId) => {
    if (useDynamicIds && todoId) {
      return `${baseId}-${todoId}`;
    }
    return baseId;
  };

  const bookmarkClass = `action-btn bookmark-view-btn${
    isBookmarked ? " bookmarked" : ""
  }`;
  const doneClass = `action-btn done-todo-btn${
    isCompleted ? " completed" : ""
  }`;

  return `
    <div class="todo-view-actions">
      <button
        class="${bookmarkClass}"
        id="${getButtonId("bookmarkViewBtn")}"
        title="Als Lesezeichen markieren"
        data-action="bookmark"
        ${todoId ? `data-todo-id="${todoId}"` : ""}
      >
        <div class="action-icon bookmark-view-icon"></div>
      </button>

      <button
        class="${doneClass}"
        id="${getButtonId("doneTodoBtn")}"
        title="Todo als erledigt markieren"
        data-action="done"
        ${todoId ? `data-todo-id="${todoId}"` : ""}
      >
        <div class="action-icon done-todo-icon"></div>
      </button>

      <button
        class="action-btn share-todo-btn"
        id="${getButtonId("shareTodoBtn")}"
        title="Todo teilen"
        data-action="share"
        ${todoId ? `data-todo-id="${todoId}"` : ""}
      >
        <div class="action-icon share-todo-icon"></div>
      </button>

      <button
        class="action-btn copy-todo-btn"
        id="${getButtonId("copyTodoBtn")}"
        title="Todo kopieren"
        data-action="copy"
        ${todoId ? `data-todo-id="${todoId}"` : ""}
      >
        <div class="action-icon copy-todo-icon"></div>
      </button>

      <button
        class="action-btn delete-todo-btn"
        id="${getButtonId("deleteTodoBtn")}"
        title="Todo löschen"
        data-action="delete"
        ${todoId ? `data-todo-id="${todoId}"` : ""}
      >
        <div class="action-icon delete-todo-icon"></div>
      </button>
    </div>
  `;
};

/**
 * Renders action buttons for todo list items (with dynamic IDs)
 * @param {Object} todo - Todo object
 * @returns {string} HTML string for action buttons
 */
export const renderListActionButtons = (todo) => {
  return renderActionButtons({
    todoId: todo.id,
    isBookmarked: todo.bookmarked,
    isCompleted: todo.completed,
    useDynamicIds: true,
    context: "list",
  });
};

/**
 * Renders action buttons for single todo view (static IDs)
 * @param {Object} todo - Todo object (optional for new todos)
 * @returns {string} HTML string for action buttons
 */
export const renderSingleActionButtons = (todo = {}) => {
  return renderActionButtons({
    todoId: todo.id || null,
    isBookmarked: todo.bookmarked || false,
    isCompleted: todo.completed || false,
    useDynamicIds: false,
    context: todo.id ? "edit" : "create",
  });
};

/**
 * Helper function to get action button configuration for event handlers
 * @param {string} context - Context: 'list', 'create', 'edit'
 * @param {string} todoId - Todo ID (for dynamic contexts)
 * @returns {Object} Button configuration object
 */
export const getActionButtonConfig = (context = "single", todoId = null) => {
  const getButtonId = (baseId) => {
    if (context === "list" && todoId) {
      return `${baseId}-${todoId}`;
    }
    return baseId;
  };

  return {
    bookmark: {
      elementId: getButtonId("bookmarkViewBtn"),
      action: "bookmark",
      todoId: todoId,
    },
    done: {
      elementId: getButtonId("doneTodoBtn"),
      action: "done",
      todoId: todoId,
    },
    share: {
      elementId: getButtonId("shareTodoBtn"),
      action: "share",
      todoId: todoId,
    },
    copy: {
      elementId: getButtonId("copyTodoBtn"),
      action: "copy",
      todoId: todoId,
    },
    delete: {
      elementId: getButtonId("deleteTodoBtn"),
      action: "delete",
      todoId: todoId,
    },
  };
};
