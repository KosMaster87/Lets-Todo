# Import/Export Utilities

This directory contains all utilities related to Todo import and export functionality.

## File Organization

### Core Processing

- **`file-validation-helpers.js`** - File format validation and reader creation
- **`json-parsing-helpers.js`** - JSON parsing and data transformation utilities
- **`todo-normalization-helpers.js`** - Todo object validation and normalization

### Import Processing

- **`active-todo-import-helpers.js`** - Active todo import processing
- **`trashed-todo-import-helpers.js`** - Trashed todo import processing

### UI & Interaction

- **`file-input-helpers.js`** - File input dialog and interaction handling
- **`preview-dialog-helpers.js`** - Import preview dialogs with toast confirmations

### Core Utilities

- **`import-export-helpers.js`** - General import/export utilities and options
- **`index.js`** - Public API exports for the entire module

## Usage

### Direct Import

```javascript
import { validateFileFormat } from "./utils/import-export/file-validation-helpers.js";
```

### Via Public API (Recommended)

```javascript
import { validateFileFormat } from "./utils/import-export/index.js";
```

## Architecture Benefits

- **Modular Design**: Each file has a focused responsibility
- **Clean Separation**: Import/export logic isolated from general utilities
- **Easy Testing**: Individual modules can be unit tested independently
- **Maintainability**: Related functionality grouped together
- **Reusability**: Well-defined interfaces for easy reuse

```
src/utils/
├── import-export/                      # 🆕 Neuer Import/Export Ordner
│   ├── README.md                       # Dokumentation
│   ├── index.js                        # Public API
│   ├── file-validation-helpers.js      # Datei-Validierung
│   ├── json-parsing-helpers.js         # JSON-Parsing
│   ├── todo-normalization-helpers.js   # Todo-Normalisierung
│   ├── active-todo-import-helpers.js   # Aktive Todo-Imports
│   ├── trashed-todo-import-helpers.js  # Papierkorb-Imports
│   ├── file-input-helpers.js           # Datei-Input-Dialoge
│   ├── preview-dialog-helpers.js       # Vorschau-Dialoge
│   └── import-export-helpers.js        # Allgemeine Utilities
├── constants.js
├── contenteditable-handler.js
├── dom-helpers.js
├── dom-selectors.js
├── form-helpers.js
├── notifications.js
├── password-dom.js
├── password-strength.js
├── password-validation.js
├── sample-data.js
├── toast-notifications.js
└── ui-state-helpers.js
```

