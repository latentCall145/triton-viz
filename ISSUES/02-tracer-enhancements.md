# Title
Enhance tracer to emit V2 IR signals

# Background
Current tracer logs ops but misses loop context, program_id, memory space, and timing—data needed for Graph and Op views. We must extend tracer callbacks and data classes to populate the new IR.

# Tasks
- Capture per-op program_id (x/y/z) and enclosing loop indices (for/while) with bounds.
- Record op start/end timestamps (logical steps) to build a timeline.
- Tag ops with memory space (HBM/SRAM) based on pointer origin or heuristics.
- Attach source location (file, line, span) using call_path filtering.
- Ensure multiple grid_idx sampling works; allow grid filters.
- Add unit tests for emitted records and backward compatibility.

# Acceptance Criteria
- New fields present in tracer output and serialized in IR builder.
- Tests cover loop indexing, program_id, and memory tagging.
- Legacy flows still run without errors when V2 disabled.

# Dependencies / Notes
- Align field names with Issue 01 spec.

## Implementation Plan
- Files: tracer core (e.g., triton/visualizer/tracer.py), record models, config/flags; tests in tests/visualizer/test_tracer_v2.py.
- Changes: emit program_id x/y/z, loop stack indices/bounds, src file/line/span, memory space tag, op logical timestamps, grid_idx filters; serialize new fields; gate with TRITON_VIZ_V2; keep legacy output.
- Behavior: when flag on, enriched records produced; when off, legacy unchanged.
- Tests: assert new fields present/typed, memory tagging heuristic, grid filtering, flag-off compatibility.
