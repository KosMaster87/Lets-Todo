// lets-todo-app/src/utils/sample-data.js

/**
 * Creates sample todos for demo purposes
 */
export function createSampleTodos() {
  return [
    {
      id: generateId(),
      title: "Willkommen bei Let's Todo!",
      content:
        "Dies ist eine Beispiel-Notiz. Du kannst sie anklicken, um sie im Detail anzuzeigen, zu bearbeiten oder zu löschen.\n\nProbiere die verschiedenen Funktionen aus:\n- Klicke auf den Titel oder Text, um die Notiz zu öffnen\n- Verwende die Action-Buttons zum Bearbeiten oder Löschen\n- Nutze den Filter, um verschiedene Ansichten zu testen",
      created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      completed: false,
      bookmarked: true,
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: generateId(),
      title: "Einkaufsliste",
      content: "- Brot\n- Milch\n- Eier\n- Käse\n- Äpfel\n- Bananen",
      created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      completed: true,
      bookmarked: false,
      lastModified: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    // {
    //   id: generateId(),
    //   title: "Meeting Todos",
    //   content:
    //     "Projektbesprechung vom 20.09.2025:\n\n1. Status Update\n2. Nächste Schritte definieren\n3. Deadlines festlegen\n4. Ressourcen zuweisen\n\nAktionspunkte:\n- Dokumentation aktualisieren\n- Tests durchführen\n- Deployment vorbereiten",
    //   created: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    //   completed: false,
    //   bookmarked: false,
    //   lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    // },
  ];
}

/**
 * Creates sample trashed todos for demo purposes
 */
export function createSampleTrashedTodos() {
  return [
    {
      id: generateId(),
      title: "Alte Projektidee",
      content:
        "Eine App-Idee, die wir hatten, aber dann doch nicht umgesetzt haben.\n\nFeatures:\n- Real-time Chat\n- Video Calls\n- File Sharing\n- Task Management\n\nReason für Verwerfung: Zu komplex für MVP",
      created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      completed: false,
      bookmarked: false,
      lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      deletedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Deleted 2 days ago
    },
    {
      id: generateId(),
      title: "Veraltete Einkaufsliste",
      content:
        "- Sommer-Kleidung\n- Sonnencreme\n- Grillzubehör\n- Poolzubehör",
      created: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      completed: true,
      bookmarked: false,
      lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      deletedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // Deleted 6 hours ago
    },
    // {
    //   id: generateId(),
    //   title: "Fehlgeschlagenes Experiment",
    //   content:
    //     "Versuch, eine neue CSS Animation zu implementieren.\n\nProblem: Performance-Issues auf älteren Geräten\nLösung: Zurück zur einfacheren Animation\n\nCode-Snippet war:\n.fancy-animation {\n  transform: rotateX(45deg) rotateY(45deg);\n  transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);\n}",
    //   created: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    //   completed: false,
    //   bookmarked: true,
    //   lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    //   deletedAt: new Date(Date.now() - 20 * 60 * 1000), // Deleted 20 minutes ago
    // },
    // {
    //   id: generateId(),
    //   title: "Spam Notiz",
    //   content: "Test test test...",
    //   created: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    //   completed: false,
    //   bookmarked: false,
    //   lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    //   deletedAt: new Date(Date.now() - 5 * 60 * 1000), // Deleted 5 minutes ago
    // },
  ];
}

/**
 * Generates a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Initializes sample data if no todos exist
 * @param {Function} addTodoFn - Function to add todos to state
 * @param {Array} existingTodos - Current todos array
 * @returns {boolean} Whether sample data was added
 */
export function initializeSampleData(addTodoFn, existingTodos = []) {
  // Add sample data if no todos exist
  if (existingTodos.length === 0) {
    const sampleTodos = createSampleTodos();
    sampleTodos.forEach((todo) => {
      addTodoFn(todo);
    });
    console.log("Sample todos initialized in state");
    return true;
  }
  return false;
}

/**
 * Initializes all sample data (todos + trash) if no data exists
 * @param {Function} addTodoFn - Function to add todos to state
 * @param {Function} setTrashedTodosFn - Function to set trashed todos array in state
 * @param {Array} existingTodos - Current todos array
 * @param {Array} existingTrashedTodos - Current trashed todos array
 * @returns {Object} Object indicating what was added
 */
export function initializeAllSampleData(
  addTodoFn,
  setTrashedTodosFn,
  existingTodos = [],
  existingTrashedTodos = []
) {
  let addedTodos = false;
  let addedTrash = false;

  if (existingTodos.length === 0) {
    const sampleTodos = createSampleTodos();
    sampleTodos.forEach((todo) => {
      addTodoFn(todo);
    });
    console.log("Sample todos initialized in state");
    addedTodos = true;
  }

  if (existingTrashedTodos.length === 0) {
    const sampleTrashedTodos = createSampleTrashedTodos();
    setTrashedTodosFn(sampleTrashedTodos);
    console.log("Sample trashed todos initialized in state");
    addedTrash = true;
  }

  return { addedTodos, addedTrash };
}
