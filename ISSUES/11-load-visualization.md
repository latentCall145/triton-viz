# Title
Op visualization: Load

# Background
Load ops should show which elements are accessed from global memory (HBM) given loop/PID sliders, masks, and offsets. Needs to work for 1–5D tensors.

# Tasks
- Render grid/heatmap of accessed region for current slider state; highlight active offsets and masked-out elements.
- Fetch slice via `/api/op/:uuid` and tensor metadata; support downsampling for large shapes.
- Indicate memory level (HBM) and show shape/dtype.
- Handle out-of-bounds masks gracefully.

# Acceptance Criteria
- Given sample IR, Load view highlights correct coordinates when sliders change.
- Shows shape/dtype and memory tag; masked elements visibly distinct.
- Works for 1D–3D in initial implementation; degrades gracefully for 4–5D until Issue 16 viewer is integrated.

# Dependencies / Notes
- Slider plumbing from Issue 07; tensor viewer enhancements in Issue 16.

## Implementation Plan
- Files: web/op/load/LoadView.tsx, reuse NDViewer; styles shared with Op views.
- Changes: render grid/heatmap of accessed region per slider state; show masks distinctly; metadata (shape/dtype, HBM tag); downsample large shapes; handle OOB masks.
- Behavior: updates on slider change; 1–3D initial support; graceful degrade higher dims.
- Tests: sample IR slice renders correct coords, mask visualization, dimension coverage.
