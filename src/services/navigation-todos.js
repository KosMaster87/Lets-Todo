// lets-todo-app/src/services/navigation-todos.js

import { setCurrentView } from "../state.js";
import { VIEWS } from "../utils/constants.js";

export function setupTodosNavigation() {
  // Setup all navigation event handlers for todos creation
  setupTodosMenuNavigation();
  setupTodosFormHandlers();
  setupTodosActionButtons();
}

function setupTodosMenuNavigation() {
  const cancelBtn = document.querySelector("#todosCancelBtn");
  const saveBtn = document.querySelector("#todosSaveBtn");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      setCurrentView(VIEWS.DASHBOARD);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveTodo);
  }
}

function setupTodosFormHandlers() {
  const titleInput = document.querySelector("#todoTitle");
  const contentTextarea = document.querySelector("#todoContent");

  if (titleInput) {
    titleInput.addEventListener("blur", validateTodoTitle);
    titleInput.addEventListener("input", clearCustomValidity);
  }

  if (contentTextarea) {
    contentTextarea.addEventListener("blur", validateTodoContent);
    contentTextarea.addEventListener("input", clearCustomValidity);
  }
}

function setupTodosActionButtons() {
  const bookmarkBtn = document.querySelector("#bookmarkBtn");
  const saveTodoBtn = document.querySelector("#saveTodoBtn");
  const shareBtn = document.querySelector("#shareBtn");
  const copyBtn = document.querySelector("#copyBtn");
  const deleteTodoBtn = document.querySelector("#deleteTodoBtn");

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", handleBookmarkToggle);
  }

  if (saveTodoBtn) {
    saveTodoBtn.addEventListener("click", handleSaveTodo);
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", handleShareTodo);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", handleCopyTodo);
  }

  if (deleteTodoBtn) {
    deleteTodoBtn.addEventListener("click", handleDeleteTodo);
  }
}

function validateTodoTitle() {
  const titleInput = document.querySelector("#todoTitle");
  if (!titleInput) return;

  const title = titleInput.value.trim();

  if (title.length === 0) {
    titleInput.setCustomValidity("Bitte gib einen Titel für deine Notiz ein.");
    return false;
  }

  if (title.length > 100) {
    titleInput.setCustomValidity(
      "Der Titel darf maximal 100 Zeichen lang sein."
    );
    return false;
  }

  titleInput.setCustomValidity("");
  return true;
}

function validateTodoContent() {
  const contentTextarea = document.querySelector("#todoContent");
  if (!contentTextarea) return;

  const content = contentTextarea.value.trim();

  if (content.length === 0) {
    contentTextarea.setCustomValidity(
      "Bitte gib einen Inhalt für deine Notiz ein."
    );
    return false;
  }

  if (content.length > 5000) {
    contentTextarea.setCustomValidity(
      "Der Inhalt darf maximal 5000 Zeichen lang sein."
    );
    return false;
  }

  contentTextarea.setCustomValidity("");
  return true;
}

function clearCustomValidity(event) {
  event.target.setCustomValidity("");
}

function handleSaveTodo(event) {
  event.preventDefault();

  const titleValid = validateTodoTitle();
  const contentValid = validateTodoContent();

  if (!titleValid || !contentValid) {
    showTodosMessage("Bitte korrigiere die Eingabefehler.");
    return;
  }

  const titleInput = document.querySelector("#todoTitle");
  const contentTextarea = document.querySelector("#todoContent");

  if (!titleInput || !contentTextarea) {
    showTodosMessage("Formular konnte nicht gefunden werden.");
    return;
  }

  const todoData = {
    title: titleInput.value.trim(),
    content: contentTextarea.value.trim(),
    created: new Date(),
    completed: false,
    bookmarked: false,
  };

  // Import addTodo dynamically to avoid circular dependency
  import("../state.js").then(({ addTodo }) => {
    if (addTodo) {
      addTodo(todoData);
      showTodosMessage("Todo erfolgreich gespeichert!");

      // Clear form after successful save
      titleInput.value = "";
      contentTextarea.value = "";

      // Navigate back to dashboard after short delay
      setTimeout(() => {
        setCurrentView(VIEWS.DASHBOARD);
      }, 1500);
    } else {
      showTodosMessage("Fehler beim Speichern des Todos.");
    }
  });
}

function handleBookmarkToggle(event) {
  event.preventDefault();

  const bookmarkBtn = event.currentTarget;
  const isBookmarked = bookmarkBtn.classList.toggle("bookmarked");

  // Visual feedback
  if (isBookmarked) {
    bookmarkBtn.style.background = "rgba(255, 152, 0, 0.2)";
    showTodosMessage("Als Lesezeichen markiert!");
  } else {
    bookmarkBtn.style.background = "rgba(255, 255, 255, 0.9)";
    showTodosMessage("Lesezeichen entfernt!");
  }
}

function handleShareTodo(event) {
  event.preventDefault();

  const titleInput = document.querySelector("#todoTitle");
  const contentTextarea = document.querySelector("#todoContent");

  if (!titleInput || !contentTextarea) return;

  const title = titleInput.value.trim();
  const content = contentTextarea.value.trim();

  if (!title && !content) {
    showTodosMessage("Keine Inhalte zum Teilen vorhanden.");
    return;
  }

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

function handleCopyTodo(event) {
  event.preventDefault();

  const titleInput = document.querySelector("#todoTitle");
  const contentTextarea = document.querySelector("#todoContent");

  if (!titleInput || !contentTextarea) return;

  const title = titleInput.value.trim();
  const content = contentTextarea.value.trim();
  const copyText = `${title}\n\n${content}`;

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        showTodosMessage("Todo in die Zwischenablage kopiert!");
      })
      .catch(() => {
        fallbackCopy(copyText);
      });
  } else {
    fallbackCopy(copyText);
  }
}

function handleDeleteTodo(event) {
  event.preventDefault();

  if (confirm("Möchten Sie den aktuellen Inhalt wirklich löschen?")) {
    const titleInput = document.querySelector("#todoTitle");
    const contentTextarea = document.querySelector("#todoContent");

    if (titleInput) titleInput.value = "";
    if (contentTextarea) contentTextarea.value = "";

    showTodosMessage("Inhalt gelöscht!");
  }
}

function fallbackShare(text) {
  fallbackCopy(text);
  showTodosMessage("Todo kopiert - kann nun geteilt werden!");
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
    showTodosMessage("Todo in die Zwischenablage kopiert!");
  } catch (err) {
    showTodosMessage("Kopieren fehlgeschlagen.");
  }

  document.body.removeChild(textArea);
}

function showTodosMessage(message) {
  // TODO: Implement proper toast/message display system
  console.log("Todos message:", message);

  // Temporary alert for now
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
  `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      document.body.removeChild(messageDiv);
    }
  }, 3000);
}
