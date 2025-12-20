# Title
Replace Flask server with FastAPI

# Background
The current server is built on Flask (`triton_viz/visualizer/interface.py`) and handles templates/static assets plus JSON API routes. We want to move to FastAPI for typing, async support, and OpenAPI docs while keeping route behavior stable.

# Tasks
- Replace Flask app with FastAPI and preserve existing routes: `/`, `/debug`, `/api/data`, `/api/update_data`, `/api/setop`, `/api/getValue`, `/api/getLoadValue`, `/api/getLoadTensor`, `/shutdown`.
- Serve templates and static assets via `Jinja2Templates` and `StaticFiles`.
- Convert request parsing to pydantic models while keeping response schemas and status codes unchanged.
- Update launch/share flow to run under `uvicorn` and keep cloudflared integration.
- Update dependencies: remove `flask`/`flask_cloudflared`, add `fastapi`/`uvicorn` (and `jinja2` if needed).

# Acceptance Criteria
- All routes return the same payloads and status codes as before.
- `launch(share=True|False)` and `stop_server` still work, including cloudflared links.
- Templates and static assets render unchanged.
- OpenAPI docs are available (e.g., `/docs`) without impacting existing routes.

# Dependencies / Notes
- Keep behavior aligned with Issues 01 and 03 for route contracts.

## Implementation Plan
- Files: triton_viz/visualizer/interface.py (or new server module), pyproject.toml, README.md.
- Changes: swap Flask app for FastAPI app, mount templates/static, port request parsing to pydantic, run via uvicorn, keep shutdown handling or provide a replacement.
- Behavior: no user-facing route changes; FastAPI docs exposed.
- Tests: add request/response tests for all API routes; verify template render and static asset serving.
