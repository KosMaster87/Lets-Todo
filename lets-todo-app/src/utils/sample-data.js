/**
 * @fileoverview Sample data utilities for todos and trash
 * @description Functions to initialize and create sample todo and trashed todo data for demo purposes in Let's Todo app
 * @module sample-data
 */

/**
 * Initializes all sample data (todos + trash) if no data exists
 * @param {Function} addTodoFn - Function to add todos to state
 * @param {Function} setTrashedTodosFn - Function to set trashed todos array in state
 * @param {Array} existingTodos - Current todos array
 * @param {Array} existingTrashedTodos - Current trashed todos array
 * @returns {Object} Object indicating what was added
 */
export const initializeAllSampleData = (
  addTodoFn,
  setTrashedTodosFn,
  existingTodos = [],
  existingTrashedTodos = []
) => {
  const addedTodos = initializeSampleTodos(addTodoFn, existingTodos);
  const addedTrash = initializeSampleTrashedTodos(setTrashedTodosFn, existingTrashedTodos);
  return { addedTodos, addedTrash };
};

/**
 * Initializes sample todos if none exist
 * @param {Function} addTodoFn - Function to add todos to state
 * @param {Array} existingTodos - Current todos array
 * @returns {boolean} Whether sample todos were added
 */
const initializeSampleTodos = (addTodoFn, existingTodos) => {
  if (existingTodos.length > 0) return false;

  const sampleTodos = createSampleTodos();
  sampleTodos.forEach((todo) => addTodoFn(todo));
  console.log("Sample todos initialized in state");
  return true;
};

/**
 * Initializes sample trashed todos if none exist
 * @param {Function} setTrashedTodosFn - Function to set trashed todos array in state
 * @param {Array} existingTrashedTodos - Current trashed todos array
 * @returns {boolean} Whether sample trashed todos were added
 */
const initializeSampleTrashedTodos = (setTrashedTodosFn, existingTrashedTodos) => {
  if (existingTrashedTodos.length > 0) return false;

  const sampleTrashedTodos = createSampleTrashedTodos();
  setTrashedTodosFn(sampleTrashedTodos);
  console.log("Sample trashed todos initialized in state");
  return true;
};

/**
 * Generates a unique ID
 * @returns {string} Unique ID
 */
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

/**
 * Creates sample todos for demo purposes
 * @returns {Array} Array of sample todo objects
 */
export const createSampleTodos = () => [
  {
    id: generateId(),
    title: "Welcome to Let's Todo!",
    content:
      "This is a sample note. You can click on it to view it in detail, edit it, or delete it.\n\nTry out the different features:\n- Click on the title or text to open the note\n- Use the action buttons to edit or delete\n- Use the filter to test different views",
    created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    completed: false,
    bookmarked: true,
    lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: generateId(),
    title: "Shopping List",
    content: "- Bread\n- Milk\n- Eggs\n- Cheese\n- Apples\n- Bananas",
    created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    completed: true,
    bookmarked: false,
    lastModified: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },
  {
    id: generateId(),
    title: "Meeting Notes",
    content:
      "Project meeting from October 19, 2025:\n\n1. Status Update\n2. Define next steps\n3. Set deadlines\n4. Assign resources\n\nAction items:\n- Update documentation\n- Run tests\n- Prepare deployment",
    created: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    completed: false,
    bookmarked: false,
    lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
];

/**
 * Creates sample trashed todos for demo purposes
 * @returns {Array} Array of sample trashed todo objects
 */
export const createSampleTrashedTodos = () => [
  {
    id: generateId(),
    title: "Old Project Ideas",
    content:
      "Ideas that are no longer relevant:\n- Desktop app\n- Mobile widget\n- Browser extension",
    created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    completed: false,
    bookmarked: false,
    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    trashed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    id: generateId(),
    title: "Completed Training",
    content: "Online course completed on October 15, 2025",
    created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    completed: true,
    bookmarked: false,
    lastModified: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    trashed: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
  },
];
