# Title
Frontend shell: split pane with Graph/Op tabs

# Background
We need a minimal SPA shell with a code editor on the left and a right pane that can host embeddable HTML/CSS/JS for future Graph and Op views. The layout should have a draggable gutter and only two tabs (Graph, Op) controlling the right pane.

# Tasks
- Replace current canvas page with SPA scaffold while keeping legacy under `/debug`.
- Implement tab bar with two tabs: Graph and Op; default to Graph; remember the last tab.
- Add split-pane layout with draggable gutter; persist widths in localStorage.
- Embed a code editor (syntax highlighting, auto-indent, read-only for now) in the left pane with line highlight and click-to-select events.
- Expose a slot/container on the right pane for embeddable HTML/CSS/JS content used by Graph/Op views.

# Acceptance Criteria
- Tabs switch without reload; gutter resizes panes and persists across reloads.
- Code editor renders with highlighting/auto-indent, supports line highlight and click-to-select events.
- Right pane swaps Graph/Op content when tabs change and can host arbitrary embedded HTML/JS.
- Legacy visualizer still reachable via existing `/debug`.

# Dependencies / Notes
- Needs API from Issue 01/03 for data fetch; selection events feed Graph/Op (Issues 05/07).

## Implementation Plan
- Files: web/index.html, web/main.js (or src/main.tsx), styles, state store; preserve legacy /debug entry.
- Changes: SPA scaffold with Graph/Op tabs, split-pane with draggable gutter (persist width), code editor wiring (read-only, highlight/click emit), right-pane content slot.
- Behavior: default Graph tab; gutter widths persist; legacy route intact.
- Tests: UI smoke—tab switch, gutter persistence, editor renders and emits selection events.
