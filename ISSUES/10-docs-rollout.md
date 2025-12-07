# Title
Docs, toggles, and rollout plan

# Background
We need concise docs so users can run the new visualizer, and a rollout toggle to keep legacy behavior available while V2 stabilizes.

# Tasks
- Update README or add `docs/v2-visualizer.md` describing usage, env flags (`TRITON_VIZ_V2`), and endpoints.
- Document how to fall back to legacy (`/debug` or flag off).
- Add change log entry summarizing V2 features.
- Provide migration notes for contributors touching tracer/IR paths.

# Acceptance Criteria
- Docs checked in with clear steps to enable/disable V2 and run tests.
- Legacy fallback documented and tested.
- Changelog entry present (if using one) or noted in docs.

# Dependencies / Notes
- Finalize after core features (Issues 01–08) are stable.

## Implementation Plan
- Files: docs/v2-visualizer.md (new), README.md updates, CHANGELOG.md entry, possibly legacy note in docs.
- Changes: usage and enable/disable instructions (TRITON_VIZ_V2), endpoint summary, legacy fallback steps, migration notes for contributors.
- Behavior: documented toggle and fallback; legacy path verified.
- Tests: markdown/link lint; optional small script/checklist to verify flag toggles routes.
