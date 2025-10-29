/**
 * @fileoverview Toast notification utility for user feedback
 * @description Provides functions to show toast notifications
 * @module toast-notifications
 */

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type ('success', 'error', 'info', 'warning')
 * @param {Object} options - Additional options
 * @param {number} options.duration - Auto-remove duration in ms
 * @param {boolean} options.closeable - Whether toast can be manually closed
 */
export const showToast = (message, type = "info", options = {}) => {
  const { duration = type === "success" ? 5000 : 8000, closeable = true } =
    options;

  removeExistingToasts(type);

  if (!document.getElementById("toast-styles")) {
    addToastStyles();
  }

  const toast = createToastElement(message, type, closeable);
  document.body.appendChild(toast);
  setupToastAutoRemoval(toast, duration);

  return toast;
};

/**
 * Removes existing toasts of the same type
 * @param {string} type - Toast type to remove
 */
const removeExistingToasts = (type) => {
  const existingToasts = document.querySelectorAll(`.toast-${type}`);
  existingToasts.forEach((toast) => {
    toast.classList.add("toast-fade-out");
    setTimeout(() => toast.remove(), 300);
  });
};

/**
 * Creates toast element with content and styling
 * @param {string} message - Message to display
 * @param {string} type - Toast type
 * @param {boolean} closeable - Whether toast can be manually closed
 * @returns {HTMLElement} Toast element
 */
const createToastElement = (message, type, closeable) => {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${getToastIcon(type)}</div>
    <div class="toast-message">${message}</div>
    ${
      closeable
        ? '<button class="toast-close" onclick="this.parentElement.remove()">×</button>'
        : ""
    }
  `;
  return toast;
};

/**
 * Sets up auto-removal for toast after specified duration
 * @param {HTMLElement} toast - Toast element
 * @param {number} duration - Duration in ms (0 = no auto-removal)
 */
const setupToastAutoRemoval = (toast, duration) => {
  if (duration <= 0) return;

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add("toast-fade-out");
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
};

// ###########################################################

/**
 * Shows a success toast
 * @param {string} message - Success message
 * @param {Object} options - Additional options
 */
export const showSuccessToast = (message, options = {}) => {
  return showToast(message, "success", options);
};

/**
 * Shows an error toast
 * @param {string} message - Error message
 * @param {Object} options - Additional options
 */
export const showErrorToast = (message, options = {}) => {
  return showToast(message, "error", options);
};

/**
 * Shows an info toast
 * @param {string} message - Info message
 * @param {Object} options - Additional options
 */
export const showInfoToast = (message, options = {}) => {
  return showToast(message, "info", options);
};

/**
 * Shows a warning toast
 * @param {string} message - Warning message
 * @param {Object} options - Additional options
 */
export const showWarningToast = (message, options = {}) => {
  return showToast(message, "warning", options);
};

/**
 * Gets the appropriate icon for toast type
 * @param {string} type - Toast type
 * @returns {string} Emoji icon
 */
const getToastIcon = (type) => {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };
  return icons[type] || icons.info;
};

/**
 * Adds toast notification CSS styles to the page
 */
const addToastStyles = () => {
  const styleSheet = document.createElement("style");
  styleSheet.id = "toast-styles";
  styleSheet.textContent = `
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 300px;
      max-width: 500px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 10000;
      font-family: var(--font-family, system-ui, -apple-system, sans-serif);
      font-size: 14px;
      color: white;
      animation: toastSlideIn 0.3s ease-out;
      backdrop-filter: blur(10px);
    }

    .toast-success {
      background: linear-gradient(135deg, #10b981, #059669);
      border-left: 4px solid #047857;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .toast-error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border-left: 4px solid #b91c1c;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .toast-warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-left: 4px solid #b45309;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .toast-info {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border-left: 4px solid #1d4ed8;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .toast-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      line-height: 1.4;
      font-weight: 500;
    }

    .toast-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
      flex-shrink: 0;
    }

    .toast-close:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .toast-fade-out {
      animation: toastSlideOut 0.3s ease-in forwards;
    }

    /* Support for multiple toasts */
    .toast:nth-child(n+2) {
      margin-top: 10px;
    }

    /* Stack multiple toasts */
    .toast ~ .toast {
      top: calc(20px + (80px * var(--toast-index, 1)));
    }

    @keyframes toastSlideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes toastSlideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .toast {
        left: 10px;
        right: 10px;
        top: 10px;
        min-width: auto;
        max-width: none;
        font-size: 13px;
        padding: 12px;
      }

      .toast ~ .toast {
        top: calc(10px + (70px * var(--toast-index, 1)));
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .toast {
        border: 2px solid white;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .toast {
        animation: none;
        transition: opacity 0.3s ease;
      }

      .toast-fade-out {
        animation: none;
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);

  // Update toast positions when new toasts are added
  updateToastPositions();
};

/**
 * Updates positions of all visible toasts for proper stacking
 */
const updateToastPositions = () => {
  const toasts = document.querySelectorAll(".toast");
  toasts.forEach((toast, index) => {
    toast.style.setProperty("--toast-index", index);
  });
};

/**
 * Clears all visible toasts
 * @param {string} type - Optional: Clear only toasts of specific type
 */
export const clearAllToasts = (type = null) => {
  const selector = type ? `.toast-${type}` : ".toast";
  const toasts = document.querySelectorAll(selector);

  toasts.forEach((toast) => {
    toast.classList.add("toast-fade-out");
    setTimeout(() => toast.remove(), 300);
  });
};
