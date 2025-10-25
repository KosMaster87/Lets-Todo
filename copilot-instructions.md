# Developer Branch Copilot Instructions - Let's Todo App

## Development Environment Context

This is the **main development branch** for the Let's Todo App frontend. This branch serves as:

- Primary development environment for new features
- Integration point for feature branches
- Testing ground for experimental implementations
- Reference implementation for other developers

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

## Development-Specific Best Practices

- No inline styles or inline event handlers in HTML.
- No magic numbers or strings – use constants instead.
- **ECMAScript Modules**: Use exclusively modern ES6+ modules (`import`/`export`). No CommonJS (`require`/`module.exports`). Target: `module: "es2020"`.
- Name components and functions clearly.
- No duplicate IDs or class names.
- Consistent code formatting (e.g., Prettier, EditorConfig).
- No direct manipulation of state object outside setter functions.

## Development Environment Guidelines

- **Experimental Features**: Feel free to implement and test new approaches
- **Code Documentation**: Extra verbose comments for complex implementations
- **Debug Information**: Console logs and debug helpers are acceptable for development
- **Performance Testing**: Include performance measurement code where beneficial
- **Feature Flags**: Use feature toggles for experimental functionality
- **Comprehensive Error Handling**: Detailed error logging and user feedback

## Reactive UI Updates

- Always control UI changes via central state objects and render functions.
- No direct DOM manipulations outside of render functions.
- State changes always trigger re-rendering of affected UI components.
- Register event listeners only once during initialization.

## State Management Pattern

- Central state object in `main-state.js` with comprehensive todo management
- **Getter Functions**: Always use getter functions for safe state access (e.g., `getTodos()`, `getUser()`)
- **Setter Functions**: All state changes only through specialized setter functions (e.g., `addTodo()`, `updateTodo()`)
- Each state change triggers re-rendering of affected components via `notifyListeners()`.
- No global variables outside the state object.
- Immutable updates: Never mutate state directly, always create new objects/arrays.

## Development Branch Workflow

- **Feature Integration**: Merge completed feature branches into this branch
- **Testing Ground**: Test new implementations before production release
- **Code Reviews**: All changes should be reviewed for quality and consistency
- **Documentation**: Keep README and documentation up to date with new features
- **Refactoring**: Continuous improvement and code optimization

## Architecture Overview

- **Services Layer**: CRUD operations in `src/services/crud/`
- **State Management**: Centralized in `src/state/`
- **UI Components**: Modular components in `src/components/`
- **Utilities**: Helper functions in `src/utils/`
- **Styling**: Theme-based CSS with dark/light mode support
