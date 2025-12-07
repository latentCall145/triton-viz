# Title
Op visualization: Reduce (sum/min/max)

# Background
Reduce ops need to show which axis is being reduced, how dimensions collapse, and partial results across iterations.

# Tasks
- Visualize input tensor with highlighted reduction axis; show resulting output shape.
- Animate partial reductions over the reduction axis tied to timeline/steps.
- Display keep_dims vs squeeze behavior; show dtype and accumulation dtype if different.
- Provide per-element inspection: show contributing indices for a selected output cell.

# Acceptance Criteria
- Sample reduce_sum correctly highlights axis and shows partial accumulation as timeline advances.
- Output shape updates according to keep_dims flag.
- Works for 1–3D; notes limitations for higher dims until Issue 16 viewer is integrated.

# Dependencies / Notes
- Needs shape/axis metadata from IR (Issue 03) and timeline (Issue 06).

## Implementation Plan
- Files: web/op/reduce/ReduceView.tsx, timeline hook, styles.
- Changes: highlight reduction axis on input, show output shape (keep_dims), animate partial accumulation over timeline, per-element contributor list; 1–3D support, note limits for higher dims until NDViewer.
- Behavior: timeline advances partials; shape updates with keep_dims flag.
- Tests: axis highlighting matches metadata, output shape calc, partial progression steps.
