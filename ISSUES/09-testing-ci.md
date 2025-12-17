# Title
Testing & CI for V2 visualizer

# Background
New IR, API, and frontend need coverage to avoid regressions. Add targeted tests and lightweight automation.

# Tasks
- Add unit tests for IR builder serialization (shapes, loop/pid fields, deps).
- Add tracer tests for program_id/loop/timeline emission (Issue 18).
- Add frontend smoke test (Playwright or minimal puppeteer) to assert tab switching, run→graph flow, slider existence.
- Wire tests into existing `pytest`/CI config; add npm/JS test step if needed.
- Provide fixture data (sample IR JSON) for FE tests.

# Acceptance Criteria
- `pytest` passes locally with new tests; FE smoke test runnable via one command.
- CI config updated (or documented) to run new tests.
- Fixtures checked in and used by tests.

# Dependencies / Notes
- Builds on Issues 01–08; choose minimal FE test stack to keep setup light.

## Implementation Plan
- Files: expand tests in tests/visualizer/test_ir_builder_v2.py, test_tracer_v2.py; add FE smoke in web/tests/smoke.spec.ts (Playwright or similar); CI config .github/workflows/ci.yml.
- Changes: fixtures for IR JSON, npm test step, document commands; ensure pytest collects new suites and FE smoke runs via single command.
- Behavior: CI runs tracer+IR+FE smoke; fixtures reused across tests.
- Tests: the added suites themselves; CI workflow validation locally (dry-run) if possible.

## Testing Notes
- Run pytest for backend suites.
- Run npm/yarn test (Playwright) for FE smoke.
- CI workflow executes both; document commands in README/docs.
