# Title
Frontend shell: tabs, layout, run flow

# Background
The V2 UI needs the Edit/Graph/Op tabs, draggable gutter, and run-to-graph navigation shown in the wireframe.

# Tasks
- Replace current canvas page with SPA scaffold (HTML + JS entry) while keeping legacy under `/debug`.
- Implement tab bar (Edit/Graph/Op) with state sync and default to Edit on load.
- Add two-pane layout with draggable gutter; persist widths in localStorage.
- Wire "Run" button to `/api/run`, show loading state, auto-switch to Graph on success.
- Load kernel source into read-only code editor (CodeMirror/Monaco), support line highlighting and click-to-select.

# Acceptance Criteria
- Tabs switch without reload; gutter resizes code/viz panes and persists.
- Run button triggers backend, disables during execution, and navigates to Graph.
- Code view highlights selected line and emits selection events.
- Legacy visualizer still reachable via existing `/debug`.

# Dependencies / Notes
- Needs API from Issue 01/03; CodeView selection feeds Graph/Op (Issues 05–08).

## Implementation Plan
- Files: web/index.html, web/main.js (or src/main.tsx), styles, state store; preserve legacy /debug entry.
- Changes: SPA scaffold with tabs (Edit/Graph/Op), two-pane layout with draggable gutter (persist width), run button wired to /api/run with loading state, read-only code editor with line highlight/click emit, tab state sync.
- Behavior: default Edit tab; run switches to Graph on success; gutter widths persist; legacy route intact.
- Tests: UI smoke—tab switch, gutter persistence, run button disable/enable and navigation.
