# Title
Graph view with DAG layout and memory legend

# Background
Graph tab shows op DAG with chips (Load, tiles, @, Add, Store) and memory legend (HBM blue, SRAM red), responding to code selection and run timeline.

# Tasks
- Use dagre/elk (or similar) to layout nodes/edges from IR deps.
- Render nodes with labels + color by memory space; add HBM/SRAM legend.
- Support node hover/selection; selection syncs to code highlight and Op tab preload.
- Handle multiple frames: show active nodes/edges per timeline position.
- Add mini-map or zoom/pan if graph grows.

# Acceptance Criteria
- DAG renders for sample IR with correct colors and labels.
- Selecting a code line highlights its nodes; clicking a node selects line.
- Legend visible and matches memory tags.
- Works with timeline control (Issue 06).

# Dependencies / Notes
- Needs IR deps/timeline (Issue 03) and controls (Issue 06).

## Implementation Plan
- Files: web/graph/GraphView.tsx, web/graph/layout.ts (dagre/elk), styles, selection sync utilities.
- Changes: render DAG nodes/edges from IR deps, color by memory space with legend, hover/select sync to code/op, frame-aware filtering of active nodes/edges, zoom/pan or mini-map.
- Behavior: selection two-way with code; legend always visible; handles multiple frames.
- Tests: render sample IR, legend/color assertions, selection sync, frame filter behavior.
