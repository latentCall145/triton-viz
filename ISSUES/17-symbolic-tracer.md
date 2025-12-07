# Title
Symbolic tracer (shape/dtype without execution)

# Background
For safety and speed, we need a mode that traces kernels without running them, returning shapes/dtypes and op graph so the UI can visualize symbolically.

# Tasks
- Implement a symbolic tracer path that intercepts ops and records shapes/dtypes/strides without touching real data.
- Provide flag or client to switch between runtime tracer and symbolic tracer.
- Ensure outputs include enough metadata for Unary/Binary/Reduce visualization and graph layout.
- Handle dynamic shapes via symbolic dimensions where possible; document limitations.
- Wire API so `/api/run` can request symbolic mode and return compatible IR.

# Acceptance Criteria
- Symbolic run produces IR with shapes/dtypes and deps for sample kernels without executing the kernel.
- UI can render graph and per-op metadata; ops lacking data are marked "symbolic" but still visible.
- Clear fallback to runtime tracer when symbolic mode is unsupported.

# Dependencies / Notes
- Complements Issues 11–15 for data-less visualization; aligns with IR spec (Issue 01).

## Implementation Plan
- Files: triton/visualizer/symbolic_tracer.py (new), flag wiring in server routes/app to select mode, adjustments in ir_builder to accept symbolic metadata, tests tests/visualizer/test_symbolic_tracer.py.
- Changes: implement tracer that records shapes/dtypes/strides/deps without execution; support symbolic dims; mode switch in /api/run; mark outputs as symbolic for UI.
- Behavior: symbolic runs produce IR compatible with builder; fallback to runtime tracer when unsupported.
- Tests: sample kernel produces IR without executing, symbolic fields set, mode toggle works.
