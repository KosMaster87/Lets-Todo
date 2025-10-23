# Frontend Copilot Instructions - Let's Todo App

## Project Conventions

- Always use `getElementById` for DOM access in all JavaScript files. No `querySelector` or `getElementsByClassName`.
- Always use classes (`.css`) with hyphens for CSS styling (e.g., `.main-header`).
- Always use IDs (`id="..."`) in HTML in camelCase style for JavaScript selectors (e.g. `mainHeader`).
- IDs are exclusively reserved for JavaScript access.
- Classes are exclusively reserved for CSS styles.
- Always use `const` and `let`, never `var`.

## JavaScript Function Guidelines

- Each function may be a maximum of 14 lines long.
- Each function should have only one single, clearly defined task.
- Split complex functions into smaller helper functions.
- Do not use nested functions.
- When exceeding the line limit: split function into multiple specialized functions.
- Prefer arrow functions, except for constructors or event handlers that need `this`.

## JSDoc Requirements

- All JavaScript functions must have JSDoc comments in English.
- Use JSDoc format: `/** */`
- Short, concise description of the function's task.
- Document parameters with `@param {type} name - Description`.
- Document return values with `@returns {type} Description`.
- For async functions: use `@async`.

## Additional Best Practices

- No inline styles or inline event handlers in HTML.
- No magic numbers or strings – use constants instead.
- **ECMAScript Modules**: Use exclusively modern ES6+ modules (`import`/`export`). No CommonJS (`require`/`module.exports`). Target: `module: "es2020"`.
- Name components and functions clearly.
- No duplicate IDs or class names.
- Consistent code formatting (e.g., Prettier, EditorConfig).
- No direct manipulation of state object outside setter functions.

## Reactive UI Updates

- Always control UI changes via central state objects and render functions.
- No direct DOM manipulations outside of render functions.
- State changes always trigger re-rendering of affected UI components.
- Register event listeners only once during initialization.

## State Management Pattern

- Central state object in `state.js` with the following structure:

  - `x`: x

- **Getter Functions**: Always use getter functions for safe state access (e.g., `x()`, `x()`)
- **Setter Functions**: All state changes only through specialized setter functions (e.g., `x()`, `x()`)
- Each state change triggers re-rendering of affected components via `notifyListeners()`.
- No global variables outside the state object.
- Immutable updates: Never mutate state directly, always create new objects/arrays.
