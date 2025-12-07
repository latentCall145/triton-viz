# Title
Op visualization: Store

# Background
Store ops need to visualize where results are written and with what mask, similar to Load but emphasizing output tile.

# Tasks
- Render grid/heatmap of store destinations for current slider state; highlight active writes vs masked-out.
- Show value range (min/max) if available from tensor data; otherwise display "value unknown (symbolic)" when no runtime data.
- Indicate memory level (HBM/SRAM) and shape/dtype.

# Acceptance Criteria
- Store view updates correctly as loop/PID sliders change.
- Masked positions visibly differentiated; legend present.
- Works with 1–3D initially; compatible with N-D viewer from Issue 16 later.

# Dependencies / Notes
- Shares components with Load (Issue 11) and N-D viewer (Issue 16).

## Implementation Plan
- Files: web/op/store/StoreView.tsx, shared components from Load.
- Changes: visualize store destinations with mask; value range display when data available; memory level tag; symbolic message when values unknown.
- Behavior: responds to slider changes; 1–3D initial support; integrates NDViewer when ready.
- Tests: mask differentiation, value range fallback, dimension coverage.
