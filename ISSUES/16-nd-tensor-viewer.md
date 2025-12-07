# Title
N-D tensor viewer (up to 5D)

# Background
Multiple op visualizations require a robust viewer to slice and render tensors up to 5D with reasonable performance.

# Tasks
- Design a reusable viewer component that supports dimension selectors, slicing, and projection to 2D heatmap/grid.
- Provide axis dropdowns/slider pairs; allow fixing dims and navigating via sliders.
- Implement downsampling for large dimensions and color scaling (linear/log) with legend.
- Support both numeric data and symbolic placeholders.
- Expose simple API so Load/Store/Unary/Binary/Reduce views can plug in.

# Acceptance Criteria
- Viewer can display tensors up to 5D from sample fixtures; interactive slicing is responsive.
- Supports min/max display, selectable colormap, and masked element indication.
- Integrates with existing slider state (loop/PID) without conflicts.

# Dependencies / Notes
- Will be consumed by Issues 11–15.

## Implementation Plan
- Files: web/components/NDViewer.tsx, web/lib/downsample.ts, styles; shared slider/axis controls.
- Changes: dimension selectors + sliders, 2D projection heatmap with color scaling (linear/log) and legend, mask indication, symbolic placeholder mode, downsampling for large dims; API for op views to plug in.
- Behavior: supports up to 5D tensors; responsive interactions; integrates with loop/pid slider state without conflicts.
- Tests: fixture tensors up to 5D render, downsampling correctness, colormap/legend presence, masked element display.
