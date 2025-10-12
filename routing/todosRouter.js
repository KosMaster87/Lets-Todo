// routing/todosRouter.js

import { Router } from "express";

const router = Router();

/**
 * Execute database query with standardized error handling
 */
async function executeQuery(pool, res, sql, params, successCallback) {
  try {
    const [result] = await pool.query(sql, params);
    return successCallback(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
    return null;
  }
}

/**
 * Build dynamic update query for PATCH operations
 */
const buildPatchQuery = (updateData, todoId) => {
  const { title, description, completed } = updateData;
  const updates = [];
  const params = [];

  if (title !== undefined) {
    updates.push("title = COALESCE(?, title)");
    params.push(title);
  }
  if (description !== undefined) {
    updates.push("description = COALESCE(?, description)");
    params.push(description);
  }
  if (completed !== undefined) {
    updates.push("completed = COALESCE(?, completed)");
    params.push(completed);
  }

  updates.push("updated = ?");
  params.push(Date.now(), todoId);

  return { sql: `UPDATE todos SET ${updates.join(", ")} WHERE id = ?`, params };
};

/**
 * GET /api/todos - Alle Todos des aktuellen Users/Gasts abrufen
 * Sortierung: Unerledigte zuerst, dann nach Update-Zeit
 */
router.get("/", async (req, res) => {
  const sql = `SELECT
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

  await executeQuery(req.pool, res, sql, [], (rows) => res.json(rows));
});

/**
 * GET /api/todos/trash - Alle gelöschten Todos abrufen
 */
router.get("/trash", async (req, res) => {
  const sql = `SELECT
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

  await executeQuery(req.pool, res, sql, [], (rows) => res.json(rows));
});

/**
 * GET /api/todos/:id - Einzelnes Todo abrufen
 * @param {string} req.params.id - Todo-ID
 */
router.get("/:id", async (req, res) => {
  const sql = `SELECT * FROM todos WHERE id = ?`;

  await executeQuery(req.pool, res, sql, [req.params.id], (rows) => {
    if (!rows.length)
      return res.status(404).json({ message: "Todo nicht gefunden" });
    res.json(rows[0]);
  });
});

/**
 * POST /api/todos - Neues Todo erstellen
 * @param {Object} req.body - Todo-Daten
 * @param {string} req.body.title - Todo-Titel (erforderlich)
 * @param {string} [req.body.description] - Todo-Beschreibung
 * @param {number} [req.body.completed] - Erledigt-Status (0/1)
 */
router.post("/", async (req, res) => {
  const { title, description = "", completed = 0 } = req.body;
  const timestamp = Date.now();
  const sql = `INSERT INTO todos (title, description, created, updated, completed) VALUES (?, ?, ?, ?, ?)`;
  const params = [title, description, timestamp, timestamp, completed];

  await executeQuery(req.pool, res, sql, params, (result) => {
    res.status(201).json({
      id: result.insertId,
      title,
      description,
      created: timestamp,
      updated: timestamp,
      completed,
      message: "Todo erfolgreich erstellt",
    });
  });
});

/**
 * PATCH /api/todos/:id - Todo teilweise aktualisieren
 * Unterstützt partielle Updates mit COALESCE-Strategie
 *
 * @example
 * PATCH /api/todos/5
 * { "title": "Neuer Titel" }  → Nur Titel wird geändert
 *
 * @example
 * PATCH /api/todos/5
 * { "completed": 1 }          → Nur Status wird geändert
 *
 * @param {string} req.params.id - Todo-ID
 * @param {Object} req.body - Update-Daten (title, description, completed)
 */
router.patch("/:id", async (req, res) => {
  const { title, description, completed } = req.body;
  const hasUpdates =
    title !== undefined || description !== undefined || completed !== undefined;

  if (!hasUpdates) return res.status(400).json({ error: "Keine Update-Daten" });

  const { sql, params } = buildPatchQuery(
    { title, description, completed },
    req.params.id
  );

  await executeQuery(req.pool, res, sql, params, (result) => {
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Todo nicht gefunden" });
    res.json({ message: "Todo aktualisiert", changes: result.affectedRows });
  });
});

/**
 * POST /api/todos/:id/trash - Todo in Papierkorb verschieben
 * @param {string} req.params.id - Todo-ID
 */
router.post("/:id/trash", async (req, res) => {
  const timestamp = Date.now();
  const sql = `UPDATE todos SET trashed = 1, trashed_at = ?, updated = ? WHERE id = ?`;
  const params = [timestamp, timestamp, req.params.id]; // timestamp for both trashed_at and updated

  await executeQuery(req.pool, res, sql, params, (result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Todo nicht gefunden" });
    }
    res.json({
      message: "Todo in Papierkorb verschoben",
      trashedId: req.params.id,
    });
  });
});

/**
 * POST /api/todos/:id/restore - Todo aus Papierkorb wiederherstellen
 * @param {string} req.params.id - Todo-ID
 */
router.post("/:id/restore", async (req, res) => {
  const timestamp = Date.now();
  const sql = `UPDATE todos SET trashed = 0, trashed_at = NULL, updated = ? WHERE id = ?`;
  const params = [timestamp, req.params.id];

  await executeQuery(req.pool, res, sql, params, (result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Todo nicht gefunden" });
    }
    res.json({
      message: "Todo wiederhergestellt",
      restoredId: req.params.id,
    });
  });
});

/**
 * DELETE /api/todos/:id - Todo permanent löschen
 * @param {string} req.params.id - Todo-ID
 */
router.delete("/:id", async (req, res) => {
  const sql = `DELETE FROM todos WHERE id = ?`;

  await executeQuery(req.pool, res, sql, [req.params.id], (result) => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Todo nicht gefunden" });
    }
    res.json({
      message: "Todo permanent gelöscht",
      deletedId: req.params.id,
    });
  });
});

export default router;
