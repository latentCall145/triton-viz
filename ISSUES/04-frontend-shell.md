# Title
Frontend shell: split pane with Graph/Op tabs

# Background
We need a minimal SPA shell with a code editor on the left and a right pane that can host embeddable HTML/CSS/JS for future Graph and Op views. The layout should have a draggable gutter and only two tabs (Graph, Op) controlling the right pane.

# Tasks
- Provide a quick demo path: running `examples/demo.py` launches the SPA scaffold in the browser.
- Implement tab bar with two tabs: Graph and Op; default to Graph; remember the last tab.
- Add split-pane layout with draggable gutter; persist widths in localStorage.
- Embed a CodeMirror 6 editor (syntax highlighting, auto-indent, read-write for now) in the left pane with line highlight and click-to-select events.
- Expose a slot/container on the right pane for embeddable HTML/CSS/JS content used by Graph/Op views.
- Initialize the page with dummy data so the shell works without Issues 03/05/07.

# Acceptance Criteria
- Running `examples/demo.py` opens the scaffold; tabs switch without reload; gutter resizes panes and persists across reloads.
- Code editor renders with highlighting/auto-indent, supports line highlight and click-to-select events.
- Right pane swaps Graph/Op content when tabs change and can host arbitrary embedded HTML/JS.
- Legacy visualizer still reachable via existing `/debug`.
- Dummy data initializes the page when backend deps are missing.

# Dependencies / Notes
- Needs API from Issue 01/03 for data fetch; selection events feed Graph/Op (Issues 05/07).
- Use dummy data to avoid blocking on Issues 03/05/07.

## Implementation Plan
- Files: web/index.html, web/main.ts (or src/main.tsx), styles, state store; ensure `examples/demo.py` launches the scaffold.
- Changes: SPA scaffold in TypeScript with Graph/Op tabs, split-pane with draggable gutter (persist width), CodeMirror 6 wiring (read-write, highlight/click emit), right-pane content slot, dummy data initialization.
- Behavior: default Graph tab; gutter widths persist; demo opens scaffold.
- Tests: UI smoke—tab switch, gutter persistence, editor renders and emits selection events via demo.
