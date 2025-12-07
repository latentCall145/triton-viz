# Title
Op view with loop & PID sliders and per-op visualizations

# Background
Op tab shows a data slice for the selected op (heatmap/grid), with sliders for enclosing loops and program_id values. Wireframe shows a K×N grid and sliders for for/while/pid.

# Tasks
- Build Op tab container and selection state synced with code/graph.
- Auto-generate sliders from IR loop stack and pid bounds; update slice on change.
- Implement renderers:
  - load/store: grid or heatmap of accessed tile (highlight active offsets)
  - dot: tile-level matrix showing accumulating C values per step
  - reduction: axis highlight with partials
- Fetch tensor slices via `/api/op/:uuid` and existing `/api/getLoadTensor` (extend to accept launch_id).
- Handle 1D/2D/3D gracefully; show shape/min/max metadata.

# Acceptance Criteria
- Changing sliders updates visualization in place; bounds reflect IR metadata.
- Selecting an op from code/graph opens Op tab with correct data preloaded.
- Renders at least load/store/dot paths for sample IR; falls back with "unsupported op" message otherwise.

# Dependencies / Notes
- Uses IR fields and tensors from Issue 03; selection wiring from Issues 04–05.

## Implementation Plan
- Files: web/op/OpView.tsx, shared selection store, data hooks to /api/op/:uuid, slider component.
- Changes: tab container synced with code/graph selection; auto-generate loop/pid sliders from IR; preload selected op data; fallback for unsupported ops.
- Behavior: slider changes refetch slice; selection opens Op tab with data.
- Tests: selection→fetch wiring, slider bounds from IR, fallback rendering.
