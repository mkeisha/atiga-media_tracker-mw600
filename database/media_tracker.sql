PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL COLLATE NOCASE,
  type TEXT NOT NULL CHECK (type IN ('Book', 'Movie')),
  status TEXT NOT NULL CHECK (status IN ('Want to', 'In progress', 'Done')),
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  UNIQUE (title, type)
);

INSERT OR IGNORE INTO media (title, type, status, rating) VALUES
  ('The Hobbit', 'Book', 'Done', 5),
  ('Spirited Away', 'Movie', 'Want to', NULL),
  ('Dune', 'Book', 'In progress', 4);