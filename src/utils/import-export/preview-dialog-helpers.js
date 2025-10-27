/**
 * @fileoverview Preview dialog utilities with toast-based confirmations
 * @module preview-dialog-helpers
 */

/**
 * Shows import preview with toast-based confirmation
 * @param {Object} parseResult - Parsed file result
 * @param {Function} onConfirm - Callback when user confirms
 * @param {Function} onCancel - Callback when user cancels
 * @returns {void}
 */
export const showImportPreview = (parseResult, onConfirm, onCancel) => {
  const previewMessage = buildPreviewMessage(parseResult);

  addConfirmationStyles();

  const toast = createConfirmationToast(previewMessage, onConfirm, onCancel);
  document.body.appendChild(toast);

  // Auto-position the toast
  setTimeout(() => {
    const existingToasts = document.querySelectorAll(".toast");
    toast.style.top = `${20 + (existingToasts.length - 1) * 80}px`;
  }, 10);
};

/**
 * Builds complete preview message with instructions
 * @param {Object} parseResult - Parsed file result
 * @returns {string} Complete preview message
 */
export const buildPreviewMessage = (parseResult) => {
  const stats = buildPreviewStats(parseResult);

  return `${stats}

  Do you want to import these todos?
  (Duplicates will be automatically skipped)`;
};

/**
 * Builds preview statistics text
 * @param {Object} parseResult - Parsed file result
 * @returns {string} Formatted statistics text
 */
export const buildPreviewStats = (parseResult) => {
  const { activeTodos, trashedTodos, totalCount } = parseResult;

  return `
  Found in file:
  • ${activeTodos.length} aktive Todos
  • ${trashedTodos.length} gelöschte Todos
  • Insgesamt: ${totalCount} Todos`.trim();
};

/**
 * Handles user confirmation response
 * @param {boolean} confirmed - User confirmation result
 * @param {Function} onConfirm - Confirm callback
 * @param {Function} onCancel - Cancel callback
 * @returns {void}
 */
export const handlePreviewResponse = (confirmed, onConfirm, onCancel) => {
  confirmed ? onConfirm?.() : onCancel?.();
};

/**
 * Creates confirmation toast with action buttons
 * @param {string} message - Message to display
 * @param {Function} onConfirm - Confirm callback
 * @param {Function} onCancel - Cancel callback
 * @returns {HTMLElement} Toast element with buttons
 */
const createConfirmationToast = (message, onConfirm, onCancel) => {
  const toast = document.createElement("div");
  toast.className = "toast toast-confirmation";
  toast.innerHTML = `
    <div class="toast-icon">❓</div>
    <div class="toast-content">
      <div class="toast-message">${message.replace(/\n/g, "<br>")}</div>
      <div class="toast-actions">
        <button class="toast-btn toast-btn-confirm">Import</button>
        <button class="toast-btn toast-btn-cancel">Abbrechen</button>
      </div>
    </div>
  `;

  const confirmBtn = toast.querySelector(".toast-btn-confirm");
  const cancelBtn = toast.querySelector(".toast-btn-cancel");

  confirmBtn.addEventListener("click", () => {
    toast.remove();
    onConfirm?.();
  });

  cancelBtn.addEventListener("click", () => {
    toast.remove();
    onCancel?.();
  });

  return toast;
};

/**
 * Adds confirmation toast styles if not present
 * @returns {void}
 */
const addConfirmationStyles = () => {
  if (document.getElementById("confirmation-toast-styles")) return;

  const styleSheet = document.createElement("style");
  styleSheet.id = "confirmation-toast-styles";
  styleSheet.textContent = `
    .toast-confirmation {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border-left: 4px solid #1d4ed8;
      max-width: 400px;
      min-width: 350px;
    }

    .toast-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }

    .toast-message {
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .toast-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .toast-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .toast-btn-confirm {
      background-color: #10b981;
      color: white;
    }

    .toast-btn-confirm:hover {
      background-color: #059669;
    }

    .toast-btn-cancel {
      background-color: #6b7280;
      color: white;
    }

    .toast-btn-cancel:hover {
      background-color: #4b5563;
    }

    @media (max-width: 480px) {
      .toast-confirmation {
        min-width: auto;
        max-width: none;
      }

      .toast-actions {
        justify-content: stretch;
      }

      .toast-btn {
        flex: 1;
      }
    }
  `;
  document.head.appendChild(styleSheet);
};
