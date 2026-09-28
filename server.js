const express = require("express");
const dotenv = require("dotenv");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const databasePath = path.resolve(__dirname, process.env.DB_PATH || "database/media_tracker.db");
const schemaPath = path.join(__dirname, "database", "media_tracker.sql");

fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new sqlite3.Database(databasePath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function validateMedia(payload) {
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const type = payload.type;
  const status = payload.status;
  const rating = payload.rating === "" || payload.rating === null || payload.rating === undefined
    ? null
    : Number(payload.rating);
  const errors = [];

  if (!title) errors.push("Title is required.");
  if (!['Book', 'Movie'].includes(type)) errors.push("Type must be Book or Movie.");
  if (!['Want to', 'In progress', 'Done'].includes(status)) errors.push("Status is invalid.");
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    errors.push("Rating must be a whole number from 1 to 5.");
  }

  return { errors, media: { title, type, status, rating } };
}

async function initializeDatabase() {
  const schema = fs.readFileSync(schemaPath, "utf8");
  await run("PRAGMA foreign_keys = ON");
  await new Promise((resolve, reject) => db.exec(schema, (error) => error ? reject(error) : resolve()));
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/api/media", async (req, res, next) => {
  try {
    const conditions = [];
    const params = [];
    if (req.query.search) {
      conditions.push("title LIKE ?");
      params.push(`%${req.query.search.trim()}%`);
    }
    if (req.query.type) {
      conditions.push("type = ?");
      params.push(req.query.type);
    }
    if (req.query.status) {
      conditions.push("status = ?");
      params.push(req.query.status);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await all(`SELECT id, title, type, status, rating FROM media ${where} ORDER BY id DESC`, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/media/:id", async (req, res, next) => {
  try {
    const media = await get("SELECT id, title, type, status, rating FROM media WHERE id = ?", [req.params.id]);
    if (!media) return res.status(404).json({ error: "Media record not found." });
    res.json(media);
  } catch (error) {
    next(error);
  }
});

app.get("/api/stats", async (req, res, next) => {
  try {
    const stats = await get(`
      SELECT COUNT(*) AS totalMedia,
        SUM(CASE WHEN status = 'Want to' THEN 1 ELSE 0 END) AS wantToWatch,
        SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) AS completed
      FROM media
    `);
    res.json({
      totalMedia: stats.totalMedia,
      wantToWatch: stats.wantToWatch || 0,
      completed: stats.completed || 0,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/media", async (req, res, next) => {
  try {
    const { errors, media } = validateMedia(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join(" ") });
    const result = await run(
      "INSERT INTO media (title, type, status, rating) VALUES (?, ?, ?, ?)",
      [media.title, media.type, media.status, media.rating]
    );
    res.status(201).json(await get("SELECT id, title, type, status, rating FROM media WHERE id = ?", [result.id]));
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") return res.status(409).json({ error: "That title and type already exist." });
    next(error);
  }
});

app.put("/api/media/:id", async (req, res, next) => {
  try {
    const { errors, media } = validateMedia(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join(" ") });
    const result = await run(
      "UPDATE media SET title = ?, type = ?, status = ?, rating = ? WHERE id = ?",
      [media.title, media.type, media.status, media.rating, req.params.id]
    );
    if (!result.changes) return res.status(404).json({ error: "Media record not found." });
    res.json(await get("SELECT id, title, type, status, rating FROM media WHERE id = ?", [req.params.id]));
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") return res.status(409).json({ error: "That title and type already exist." });
    next(error);
  }
});

app.delete("/api/media/:id", async (req, res, next) => {
  try {
    const result = await run("DELETE FROM media WHERE id = ?", [req.params.id]);
    if (!result.changes) return res.status(404).json({ error: "Media record not found." });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong on the server." });
});

initializeDatabase()
  .then(() => app.listen(PORT, () => console.log(`Media tracker running at http://localhost:${PORT}`)))
  .catch((error) => {
    console.error("Could not initialize database:", error);
    process.exit(1);
  });