```js
// dbHelpers.js (allgemeine DB-Funktionen)
- createUserDatabase
- createUserPool
- validateUserSession
- handleQueryError     ← MOVE von todosRouter
- executeQuery         ← MOVE von todosRouter

// todosHelpers.js (todo-spezifische Funktionen)
- createTodosTable     ← MOVE von dbHelpers
- createTodosIndex     ← MOVE von dbHelpers
- buildPatchQuery      ← BLEIBT in todosRouter
```
