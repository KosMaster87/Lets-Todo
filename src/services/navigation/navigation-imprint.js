/**
 * @fileoverview Imprint Navigation Module
 * @module navigation-imprint
 */

import { handleNavigationClick } from "./navigation.js";
import { VIEWS } from "./../../utils/constants.js";

/**
 * @function setupImprintNavigation
 * @description Sets up click event handlers for imprint navigation buttons
 * @returns {void} No return value - configures DOM event listeners as side effect
 */
const setupImprintNavigation = () => {
  const imprintCancelBtn = document.getElementById("imprintCancelBtn");
  if (imprintCancelBtn) {
    imprintCancelBtn.onclick = (e) => handleNavigationClick(e, VIEWS.OPTIONS);
  }
};

/**
 * @function setupImprintEventListeners
 * @exports
 * @description Sets up comprehensive imprint-specific navigation handlers
 * @returns {void} No return value - configures all imprint page event listeners as side effects
 */
export const setupImprintEventListeners = () => {
  setupImprintNavigation();
};
