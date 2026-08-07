# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Prashanth Hospital Master Data Governance & Sanitization Platform. The README describes a full metadata-driven Single Source of Truth (master registry, duplicate/fuzzy-match validation, multi-role approval routing, Kranium export) — but what's actually deployed and tested today is a narrower **Master File Analyzer**: upload a hospital master CSV/Excel, run data-quality analysis, download an annotated correction workbook.

## Critical gotcha: two backends exist, only one is live

`backend/` contains **both**:
- `main.py` + `analyzer.py`, `parser.py`, `excel_generator.py`, `database.py` — **Python/FastAPI**, port `5050`, SQLite (`master_analyzer.db`). This is the one `deploy.sh` runs and the one the frontend's Vite proxy targets. **This is the authoritative backend.**
- `src/server.js` + `src/registry`, `src/engine`, `src/controllers`, `src/routes` — a separate **Node/Express** API matching the README's full governance model. Not started by `deploy.sh` or referenced by the frontend proxy — appears to be legacy/unused by the current deploy path.

The README's "Manual Local Setup" section (`cd backend && npm install && npm start`) points at the *unused* Node backend and will not match what's actually running. Don't "fix" the Python backend to match the Node one, or vice versa, without checking which one deploy.sh/PM2 actually runs.

## Running it (per `deploy.sh`)

```bash
# Backend (Python) — no requirements.txt; deps installed ad hoc:
python3 -m pip install fastapi uvicorn pandas polars openpyxl xlsxwriter rapidfuzz python-multipart --break-system-packages

# Frontend
cd frontend && npm install && npm run build

# Run via PM2
pm2 start "python3 main.py" --cwd backend --name mdg-backend        # port 5050
pm2 start "npm run dev -- --host 0.0.0.0 --port 3001" --cwd frontend --name mdg-frontend  # port 3001
```

## Testing

No test runner configured (no pytest, no `test`/`lint` npm scripts). Tests are plain scripts, not assertions-based:
- `backend/test_acceptance.py`, `backend/test_full_e2e_verification.py` — run directly with `python3 backend/test_acceptance.py`, prints results.
- `test_e2e_server.py` (repo root) — hits a live server on `localhost:3001`/`5050`; the app must already be running.

No linter/formatter is configured for either the Python or Node/React code — nothing enforces style here.

## Other notes

- No `.env`/env vars required — none are used anywhere in the app.
- Excel workbooks are written to hardcoded `/tmp/workbooks` (`WORKBOOK_DIR` in `main.py`).
- Commits loosely follow Conventional Commits (`feat:`, `fix:`, `style:`), sometimes scoped (`fix(frontend): ...`). Default branch is `master`.
