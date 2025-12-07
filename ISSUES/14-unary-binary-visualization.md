# Title
Op visualization: Unary/Binary elementwise

# Background
Unary/binary ops (e.g., add, mul, rsqrt, cast) should show elementwise transformation and broadcast semantics.

# Tasks
- Visualize input/output shapes with broadcasting indicators; highlight selected element(s) and their source indices.
- Show simple per-element formula preview (e.g., `out[i,j] = a[i,1] + b[0,j]`).
- Display min/max stats if available; fallback to symbolic representation when not executed.
- Support at least 1–3D tensors; leverage N-D viewer (Issue 16) for higher dims.

# Acceptance Criteria
- Broadcasted operations display correct source indices for a selected output cell.
- Users can see shapes, dtypes, and whether data is symbolic or real.
- Works for unary and binary ops; skips unsupported types with a clear message.

# Dependencies / Notes
- Requires shape metadata from IR (Issue 03) and symbolic tracer (Issue 17) for non-executed paths.

## Implementation Plan
- Files: web/op/elemwise/ElemwiseView.tsx, small formula helper.
- Changes: show input/output shapes with broadcast indicators, per-element source indices, formula preview, min/max stats when available; symbolic fallback; supports unary/binary 1–3D.
- Behavior: responds to selection and slider state; clear message for unsupported ops.
- Tests: broadcast index mapping, unary vs binary cases, symbolic flag handling.
