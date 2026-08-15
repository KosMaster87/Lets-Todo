/**
 * @fileoverview Router for managing todo items
 * @description Provides CRUD operations for todos including retrieval, creation, updating, trashing, restoring, and deletion.
 * @module routing/todosRouter
 */

import { Router } from "express";

const router = Router();

// #################################################

/**
 * Execute database query with standardized error handling
 * @param {Object} pool - Database connection pool
 * @param {Object} res - Express response object
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @param {Function} successCallback - Success callback function
 * @returns {*} Result from successCallback or null on error
 */
const executeQuery = async (pool, res, sql, params, successCallback) => {
  try {
    const [result] = await pool.query(sql, params);
    return successCallback(result);
  } catch (err) {
    return handleQueryError(res, err);
  }
};

/**
 * Handles database query errors with standardized response
 * @param {Object} res - Express response object
 * @param {Error} err - Database error
 * @returns {null}
 */
const handleQueryError = (res, err) => {
  res.status(500).json({ error: err.message });
  return null;
};

// #################################################

/**
 * GET /api/todos - Retrieve all todos for the current user
 * Sorting: Incomplete todos first, then by update time
 */
router.get("/", async (req, res) => {
  const sql = createActiveTodosQuery();
  await executeQuery(req.pool, res, sql, [], (rows) => handleTodosResponse(rows, res));
});

/**
 * Creates SQL query for fetching active todos
 * @returns {string} SQL query string
 */
const createActiveTodosQuery = () => {
  return `SELECT
    id,
    title,
    description as content,
    created,
    updated as lastModified,
    completed,
    0 as bookmarked
  FROM todos
  WHERE trashed = 0 OR trashed IS NULL
  ORDER BY completed ASC, updated DESC`;
};

/**
 * Handles successful todos retrieval
 * @param {Array} rows - Query result rows
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with todos
 */
const handleTodosResponse = (rows, res) => {
  return res.json(rows);
};

// #################################################

/**
 * GET /api/todos/trash - Retrieve all deleted todos
 */
router.get("/trash", async (req, res) => {
  const sql = createTrashedTodosQuery();
  await executeQuery(req.pool, res, sql, [], (rows) => handleTodosResponse(rows, res));
});

/**
 * Creates SQL query for fetching trashed todos
 * @returns {string} SQL query string
 */
const createTrashedTodosQuery = () => {
  return `SELECT
    id,
    title,
    description as content,
    created,
    updated as lastModified,
    completed,
    0 as bookmarked,
    trashed_at as trashedAt
  FROM todos
  WHERE trashed = 1
  ORDER BY trashed_at DESC`;
};

// #################################################

/**
 * GET /api/todos/:id - Retrieve single todo
 * @param {string} req.params.id - Todo ID
 */
router.get("/:id", async (req, res) => {
  const sql = createSingleTodoQuery();
  await executeQuery(req.pool, res, sql, [req.params.id], (rows) => {
    return handleSingleTodoResponse(rows, res);
  });
});

/**
 * Creates SQL query for fetching single todo by ID
 * @returns {string} SQL query string
 */
const createSingleTodoQuery = () => {
  return `SELECT * FROM todos WHERE id = ?`;
};

/**
 * Handles single todo response
 * @param {Array} rows - Query result rows
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with single todo or 404 error
 */
const handleSingleTodoResponse = (rows, res) => {
  if (!rows.length) {
    return res.status(404).json({ message: "Todo not found" });
  }
  return res.json(rows[0]);
};

// #################################################

/**
 * POST /api/todos - Create new todo
 * @param {Object} req.body - Todo data
 * @param {string} req.body.title - Todo title (required)
 * @param {string} [req.body.description] - Todo description
 * @param {number} [req.body.completed] - Completion status (0/1)
 */
router.post("/", async (req, res) => {
  const { title, description, completed = 0 } = req.body;
  const timestamp = Date.now();
  const todoData = { title, description, timestamp, completed };

  const { sql, params } = createInsertTodoQuery(todoData);

  await executeQuery(req.pool, res, sql, params, (result) => {
    const responseData = createNewTodoResponse(result, todoData);
    res.status(201).json(responseData);
  });
});

/**
 * Creates insert query and parameters for new todo
 * @param {Object} todoData - Todo data with defaults applied
 * @returns {Object} SQL query and parameters
 */
const createInsertTodoQuery = (todoData) => {
  const { title, description, timestamp, completed } = todoData;
  const sql = `INSERT INTO todos (title, description, created, updated, completed) VALUES (?, ?, ?, ?, ?)`;
  const params = [title, description, timestamp, timestamp, completed];
  return { sql, params };
};

/**
 * Creates success response for new todo creation
 * @param {Object} result - Database insert result
 * @param {Object} todoData - Original todo data
 * @returns {Object} Success response object
 */
const createNewTodoResponse = (result, todoData) => {
  const { title, description, timestamp, completed } = todoData;
  return {
    id: result.insertId,
    title,
    description,
    created: timestamp,
    updated: timestamp,
    completed,
    message: "Todo successfully created",
  };
};

// #################################################

/**
 * POST /api/todos/:id/trash - Move todo to trash
 * @param {string} req.params.id - Todo ID
 */
router.post("/:id/trash", async (req, res) => {
  const timestamp = Date.now();
  const { sql, params } = createTrashTodoQuery(req.params.id, timestamp);

  await executeQuery(req.pool, res, sql, params, (result) => {
    return handleTrashSuccess(result, req.params.id, res);
  });
});

/**
 * Creates trash query and parameters for moving todo to trash
 * @param {string} todoId - Todo ID
 * @param {number} timestamp - Current timestamp
 * @returns {Object} SQL query and parameters
 */
const createTrashTodoQuery = (todoId, timestamp) => {
  const sql = `UPDATE todos SET trashed = 1, trashed_at = ?, updated = ? WHERE id = ?`;
  const params = [timestamp, timestamp, todoId];
  return { sql, params };
};

/**
 * Handles successful trash operation
 * @param {Object} result - Database operation result
 * @param {string} todoId - Todo ID
 * @param {Object} res - Express response object
 * @returns {Object} Success response or 404 if no rows affected
 */
const handleTrashSuccess = (result, todoId, res) => {
  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Todo not found" });
  }
  return res.json({
    message: "Todo moved to trash",
    trashedId: todoId,
  });
};

// #################################################

/**
 * POST /api/todos/:id/restore - Restore todo from trash
 * @param {string} req.params.id - Todo ID
 */
router.post("/:id/restore", async (req, res) => {
  const timestamp = Date.now();
  const { sql, params } = createRestoreTodoQuery(req.params.id, timestamp);

  await executeQuery(req.pool, res, sql, params, (result) => {
    return handleRestoreSuccess(result, req.params.id, res);
  });
});

/**
 * Creates restore query and parameters for restoring todo from trash
 * @param {string} todoId - Todo ID
 * @param {number} timestamp - Current timestamp
 * @returns {Object} SQL query and parameters
 */
const createRestoreTodoQuery = (todoId, timestamp) => {
  const sql = `UPDATE todos SET trashed = 0, trashed_at = NULL, updated = ? WHERE id = ?`;
  const params = [timestamp, todoId];
  return { sql, params };
};

/**
 * Handles successful restore operation
 * @param {Object} result - Database operation result
 * @param {string} todoId - Todo ID
 * @param {Object} res - Express response object
 * @returns {Object} Success response or 404 if no rows affected
 */
const handleRestoreSuccess = (result, todoId, res) => {
  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Todo not found" });
  }
  return res.json({
    message: "Todo restored",
    restoredId: todoId,
  });
};

// #################################################

/**
 * DELETE /api/todos/:id - Permanently delete todo
 * @param {string} req.params.id - Todo ID
 */
router.delete("/:id", async (req, res) => {
  const sql = `DELETE FROM todos WHERE id = ?`;

  await executeQuery(req.pool, res, sql, [req.params.id], (result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json({
      message: "Todo permanently deleted",
      deletedId: req.params.id,
    });
  });
});

// #################################################

/**
 * PATCH /api/todos/:id - Partially update todo
 * Supports partial updates with COALESCE strategy
 *
 * @example
 * PATCH /api/todos/5
 * { "title": "New Title" }    → Only title will be changed
 *
 * @example
 * PATCH /api/todos/5
 * { "completed": 1 }          → Only status will be changed
 *
 * @param {string} req.params.id - Todo ID
 * @param {Object} req.body - Update data (title, description, completed)
 */
router.patch("/:id", async (req, res) => {
  const { title, description, completed } = req.body;

  const validation = validatePatchData({ title, description, completed }, res);
  if (validation !== true) return validation;

  const { sql, params } = buildPatchQuery({ title, description, completed }, req.params.id);

  await executeQuery(req.pool, res, sql, params, (result) => {
    return handlePatchSuccess(result, res);
  });
});

/**
 * Validates if patch request has any update data
 * @param {Object} updateData - Update data from request body
 * @param {Object} res - Express response object
 * @returns {boolean|Object} Returns true if valid, or error response if invalid
 */
const validatePatchData = (updateData, res) => {
  const { title, description, completed } = updateData;
  const hasUpdates = title !== undefined || description !== undefined || completed !== undefined;

  if (!hasUpdates) {
    return res.status(400).json({ error: "No update data" });
  }
  return true;
};

/**
 * Handles successful patch operation
 * @param {Object} result - Database operation result
 * @param {Object} res - Express response object
 * @returns {Object} Success response or 404 if no rows affected
 */
const handlePatchSuccess = (result, res) => {
  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Todo not found" });
  }
  return res.json({
    message: "Todo updated",
    changes: result.affectedRows,
  });
};

// #################################################

/**
 * Build dynamic update query for PATCH operations
 * @param {Object} updateData - Fields to update
 * @param {string} todoId - Todo ID
 * @returns {Object} SQL query string and parameters
 */
const buildPatchQuery = (updateData, todoId) => {
  const { updates, params } = buildUpdateFields(updateData);

  updates.push("updated = ?");
  params.push(Date.now(), todoId);

  return { sql: `UPDATE todos SET ${updates.join(", ")} WHERE id = ?`, params };
};

/**
 * Builds update fields and parameters for PATCH query
 * @param {Object} updateData - Data to update
 * @returns {Object} Object with updates array and params array
 */
const buildUpdateFields = (updateData) => {
  const { title, description, completed } = updateData;
  const updates = [];
  const params = [];

  addFieldUpdate(updates, params, "title", title);
  addFieldUpdate(updates, params, "description", description);
  addFieldUpdate(updates, params, "completed", completed);

  return { updates, params };
};

/**
 * Adds field update to query if value is defined
 * @param {Array} updates - Array of SQL update strings
 * @param {Array} params - Array of parameter values
 * @param {string} field - Field name
 * @param {*} value - Field value
 */
const addFieldUpdate = (updates, params, field, value) => {
  if (value !== undefined) {
    updates.push(`${field} = COALESCE(?, ${field})`);
    params.push(value);
  }
};

export default router;
