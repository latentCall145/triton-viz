# Title
UX polish: gutter, legend, loading/error states, shortcuts

# Background
After core views work, we need interaction refinements to meet the wireframe feel and ensure resilience.

# Tasks
- Draggable gutter between code and viz panes with hover affordance.
- Loading spinners/skeletons for Graph/Op while data fetches; empty/error states with retry.
- Keyboard shortcuts (g=Graph, o=Op, space/play) surfaced via tooltip/help.
- Color/theme alignment to mock; ensure consistent dark palette.
- Persist last tab and gutter width; reset appropriately on new run.

# Acceptance Criteria
- Gutter resizing feels smooth; sizes persist across reloads.
- Clear loading/empty/error UI in Graph and Op tabs.
- Shortcut hints visible; actions work.
- Colors/spacing match wireframe close enough (within design review).

# Dependencies / Notes
- Builds atop Issues 04–07.

## Implementation Plan
- Files: web/ui/Gutter.tsx, loaders/skeletons, error states, shortcut tooltip, palette variables; styles.
- Changes: smooth draggable gutter with hover affordance and persistence, loading/error/empty states for Graph/Op with retry, shortcut hints (g/o/space) surfaced, dark palette alignment, tab/gutter persistence resets on new run.
- Behavior: resilient UI during fetch/errors; consistent theming.
- Tests: gutter persistence, loading/error snapshots, shortcut hint presence, reset logic.
