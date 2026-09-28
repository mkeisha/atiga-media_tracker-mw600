# My Media Tracker

My Media Tracker is a small local media library for tracking books and movies. The existing HTML/CSS interface is backed by an Express REST API and a SQLite database.

## Tech Stack

- Frontend: HTML, CSS, and browser JavaScript in `public/`
- Backend: Node.js and Express in `server.js`
- Database: SQLite using the `sqlite3` package

The project has one main entity: `media`. Each media record has a title, type, status, and optional rating. The database enforces the allowed type/status values and prevents duplicate title/type pairs.

## Project Structure

```text
media-tracker-main/
|-- public/                 # frontend pages, styles, and API-connected scripts
|-- database/
|   `-- media_tracker.sql   # schema and sample INSERT data
|-- server.js               # backend API and static-file server
|-- .env.example            # environment template
|-- .env                    # local settings (ignored by git)
|-- package.json
`-- README.md
```

The repository's original `public/` folder serves as the frontend, and `server.js` is the backend entry point. No UI redesign was made.

## Database Import

The server automatically creates `database/media_tracker.db` and runs the schema/sample data in `database/media_tracker.sql` on startup.

For a manual import with the SQLite command-line tool:

```powershell
sqlite3 database/media_tracker.db ".read database/media_tracker.sql"
```

The SQL file contains `CREATE TABLE IF NOT EXISTS` and `INSERT OR IGNORE`, so it can be safely run more than once.

## Install and Run

From the project folder:

```powershell
npm install
Copy-Item .env.example .env
npm start
```

Open http://localhost:3000 in a browser. The `.env` file controls the port and SQLite path; no database username or password is needed for SQLite.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/media` | List media; supports `search`, `type`, and `status` query filters |
| GET | `/api/media/:id` | Read one media record for the edit form |
| GET | `/api/stats` | Read dashboard totals |
| POST | `/api/media` | Create a media record |
| PUT | `/api/media/:id` | Update a media record |
| DELETE | `/api/media/:id` | Delete a media record |

## CRUD Test Checklist

1. **Read:** Open `library.html` and confirm the seeded records load from SQLite. Open the dashboard and confirm Total Media, Want to Watch, and Completed are populated.
2. **Create:** Open `add.html`, submit a valid book or movie, and confirm the new record appears in the library. Submit an empty title, invalid rating, or duplicate title/type and confirm an error message appears.
3. **Read one:** Select Edit for a record and confirm the form is pre-filled from `/api/media/:id`.
4. **Update:** Change the title, type, status, or rating and submit. Confirm the library shows the changed values and the success message appears.
5. **Delete:** Select Delete, cancel the confirmation once, then confirm it and verify the record disappears from the table and dashboard counts update after refresh.
6. **Persistence:** Stop and restart the server, then confirm created/updated records remain in `database/media_tracker.db`.

To run the syntax test:

```powershell
npm test
```