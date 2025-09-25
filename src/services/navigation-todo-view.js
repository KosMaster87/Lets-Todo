// Navigation service for todo view page

import { setCurrentView, setCurrentTodo } from "../state.js";
import { VIEWS } from "../utils/constants.js";

let isEditMode = false;

export function setupTodoViewNavigation() {
  // Setup all navigation event handlers for todo view
  setupTodoViewMenuNavigation();
  setupTodoViewActionButtons();
  setupContentEditing();
}

function setupTodoViewMenuNavigation() {
  const backBtn = document.getElementById("todoViewBackBtn");
  const saveBtn = document.getElementById("todoViewSaveBtn");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      setCurrentView(VIEWS.TODOS_LIST);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveTodoView);
  }
}

function setupTodoViewActionButtons() {
  const bookmarkBtn = document.getElementById("bookmarkViewBtn");
  const editBtn = document.getElementById("editTodoBtn");
  const shareBtn = document.getElementById("shareTodoBtn");
  const copyBtn = document.getElementById("copyTodoBtn");
  const deleteBtn = document.getElementById("deleteViewTodoBtn");

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", handleBookmarkToggle);
  }

  if (editBtn) {
    editBtn.addEventListener("click", handleToggleEditMode);
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", handleShareTodo);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", handleCopyTodo);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", handleDeleteTodo);
  }
}

function setupContentEditing() {
  const contentDisplay = document.getElementById("todoContentDisplay");

  if (contentDisplay) {
    // Auto-save on content change (debounced)
    let saveTimeout;
    contentDisplay.addEventListener("input", () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        if (isEditMode) {
          autoSaveContent();
        }
      }, 2000); // Auto-save after 2 seconds of inactivity
    });

    // Handle Enter key for new lines
    contentDisplay.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // Allow normal Enter behavior for new lines
        return;
      }
    });
  }
}

function handleSaveTodoView() {
  const titleElement = document.getElementById("todoDisplayTitle");
  const contentElement = document.getElementById("todoContentDisplay");

  if (!titleElement || !contentElement) {
    showTodoViewMessage("Fehler: Inhalte konnten nicht gefunden werden.");
    return;
  }

  const newTitle = titleElement.textContent.trim();
  const newContent = contentElement.textContent.trim();

  if (!newTitle && !newContent) {
    showTodoViewMessage("Titel oder Inhalt darf nicht leer sein.");
    return;
  }

  // Import updateTodo and getCurrentTodo dynamically
  import("../state.js").then(({ updateTodo, getCurrentTodo }) => {
    const currentTodo = getCurrentTodo();
    if (currentTodo && updateTodo) {
      const updates = {
        title: newTitle || "Untitled",
        content: newContent,
        lastModified: new Date(),
      };

      updateTodo(currentTodo.id, updates);
      showTodoViewMessage("Notiz erfolgreich gespeichert!");

      // Exit edit mode after saving
      if (isEditMode) {
        toggleEditMode(false);
      }
    } else {
      showTodoViewMessage("Fehler beim Speichern der Notiz.");
    }
  });
}

function autoSaveContent() {
  const titleElement = document.getElementById("todoDisplayTitle");
  const contentElement = document.getElementById("todoContentDisplay");

  if (!titleElement || !contentElement) return;

  const newTitle = titleElement.textContent.trim();
  const newContent = contentElement.textContent.trim();

  // Import updateTodo and getCurrentTodo dynamically
  import("../state.js").then(({ updateTodo, getCurrentTodo }) => {
    const currentTodo = getCurrentTodo();
    if (currentTodo && updateTodo) {
      const updates = {
        title: newTitle || "Untitled",
        content: newContent,
        lastModified: new Date(),
      };

      updateTodo(currentTodo.id, updates);
      console.log("Auto-saved todo changes");
    }
  });
}

function handleBookmarkToggle() {
  // Import updateTodo and getCurrentTodo dynamically
  import("../state.js").then(({ updateTodo, getCurrentTodo }) => {
    const currentTodo = getCurrentTodo();
    if (currentTodo && updateTodo) {
      const newBookmarkState = !currentTodo.bookmarked;
      updateTodo(currentTodo.id, { bookmarked: newBookmarkState });

      // Update button visual state
      const bookmarkBtn = document.getElementById("bookmarkViewBtn");
      if (bookmarkBtn) {
        if (newBookmarkState) {
          bookmarkBtn.classList.add("bookmarked");
          showTodoViewMessage("Als Lesezeichen hinzugefügt!");
        } else {
          bookmarkBtn.classList.remove("bookmarked");
          showTodoViewMessage("Lesezeichen entfernt!");
        }
      }
    }
  });
}

function handleToggleEditMode() {
  toggleEditMode(!isEditMode);
}

function toggleEditMode(editMode) {
  isEditMode = editMode;
  const wrapper = document.querySelector(".todo-view-wrapper");
  const contentDisplay = document.querySelector("#todoContentDisplay");
  const titleElement = document.querySelector("#todoDisplayTitle");
  const editBtn = document.querySelector("#editTodoBtn");

  if (wrapper && contentDisplay && editBtn) {
    if (isEditMode) {
      wrapper.classList.add("edit-mode");
      contentDisplay.setAttribute("contenteditable", "true");
      if (titleElement) {
        titleElement.setAttribute("contenteditable", "true");
      }
      editBtn.title = "Bearbeitung beenden";
      showTodoViewMessage("Bearbeitungsmodus aktiviert");
    } else {
      wrapper.classList.remove("edit-mode");
      contentDisplay.setAttribute("contenteditable", "false");
      if (titleElement) {
        titleElement.setAttribute("contenteditable", "false");
      }
      editBtn.title = "Notiz bearbeiten";
      showTodoViewMessage("Bearbeitungsmodus deaktiviert");
    }
  }
}

function handleShareTodo() {
  const titleElement = document.querySelector("#todoDisplayTitle");
  const contentElement = document.querySelector("#todoContentDisplay");

  if (!titleElement || !contentElement) return;

  const title = titleElement.textContent.trim();
  const content = contentElement.textContent.trim();
  const shareText = `${title}\n\n${content}`;

  if (navigator.share) {
    navigator
      .share({
        title: title || "Meine Notiz",
        text: shareText,
      })
      .catch(() => {
        fallbackShare(shareText);
      });
  } else {
    fallbackShare(shareText);
  }
}

function handleCopyTodo() {
  const titleElement = document.querySelector("#todoDisplayTitle");
  const contentElement = document.querySelector("#todoContentDisplay");

  if (!titleElement || !contentElement) return;

  const title = titleElement.textContent.trim();
  const content = contentElement.textContent.trim();
  const copyText = `${title}\n\n${content}`;

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        showTodoViewMessage("Notiz in die Zwischenablage kopiert!");
      })
      .catch(() => {
        fallbackCopy(copyText);
      });
  } else {
    fallbackCopy(copyText);
  }
}

function handleDeleteTodo() {
  if (confirm("Möchten Sie diese Aufgabe wirklich löschen?")) {
    // Import deleteTodo and getCurrentTodo dynamically
    import("../state.js").then(({ deleteTodo, getCurrentTodo }) => {
      const currentTodo = getCurrentTodo();
      if (currentTodo && deleteTodo) {
        deleteTodo(currentTodo.id);
        showTodoViewMessage("Aufgabe wurde gelöscht!");

        // Navigate back to tasks list after deletion
        setTimeout(() => {
          setCurrentView(VIEWS.TODOS_LIST);
        }, 1500);
      } else {
        showTodoViewMessage("Fehler beim Löschen der Aufgabe.");
      }
    });
  }
}

function fallbackShare(text) {
  fallbackCopy(text);
  showTodoViewMessage("Todos kopiert - kann nun geteilt werden!");
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    showTodoViewMessage("Todo in die Zwischenablage kopiert!");
  } catch (err) {
    showTodoViewMessage("Kopieren fehlgeschlagen.");
  }

  document.body.removeChild(textArea);
}

function showTodoViewMessage(message) {
  console.log("Todo view message:", message);

  // Temporary visual feedback
  const messageDiv = document.createElement("div");
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(76, 175, 80, 0.9);
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    z-index: 1000;
    font-size: 0.9rem;
    max-width: 300px;
  `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      document.body.removeChild(messageDiv);
    }
  }, 3000);
}
