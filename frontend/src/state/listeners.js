/**
 * @fileoverview Event Listener System for State Management
 * @description Provides functions to manage state change listeners
 * @module listeners
 */

/**
 * Creates listener management functions for a given state object
 * @param {Object} state - The state object that contains the listeners array
 */
export const createListenerManager = (state) => {
  /**
   * Adds a state change listener.
   * @param {Function} listener - Listener function to add
   */
  const addListener = (listener) => {
    if (typeof listener !== "function") {
      return;
    }

    if (!state.listeners.includes(listener)) {
      state.listeners.push(listener);
    } else {
      console.warn("Listener already registered, skipping duplicate");
    }
  };

  /**
   * TODO: Implement removeListener
   * Removes a state change listener.
   * @param {Function} listener - Listener function to remove
   */
  const removeListener = (listener) => {
    const index = state.listeners.indexOf(listener);
    if (index > -1) {
      state.listeners.splice(index, 1);
      console.log(`Removed state listener (${state.listeners.length} remaining)`);
    } else {
      console.warn("Listener not found, cannot remove");
    }
  };

  /**
   * Notifies all registered listeners of state changes.
   * Includes error handling for individual listener failures.
   */
  const notifyListeners = () => {
    state.listeners.forEach((listener, index) => {
      try {
        listener();
      } catch (error) {
        console.error(`Error in state listener ${index}:`, error);
        // Continue with other listeners even if one fails
      }
    });
  };

  /**
   * Returns current number of registered listeners (for debugging)
   */
  const getListenerCount = () => state.listeners.length;

  /**
   * Clears all listeners (useful for cleanup/testing)
   */
  const clearAllListeners = () => {
    const count = state.listeners.length;
    state.listeners.length = 0; // Clear array while keeping the reference
    console.log(`Cleared all ${count} listeners`);
  };

  return {
    addListener,
    removeListener,
    notifyListeners,
    getListenerCount,
    clearAllListeners,
  };
};
