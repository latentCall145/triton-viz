# Title
Build IR assembler and backend serializers

# Background
Once tracer emits enriched records, we need to aggregate them per launch/grid and serialize for the frontend. This replaces `visualizer/analysis.py`/`draw.py` logic with a V2 pipeline.

# Tasks
- Implement IR builder that consumes tracer records and outputs V2 IR JSON (launch → lines → ops, plus timeline frames).
- Compute per-op deps/edges and summary stats (counts, shapes, memory level legend).
- Store raw tensors for load/store/dot ops for Op view retrieval.
- Expose data through `/api/data`, `/api/op/:uuid`, `/api/timeline`.
- Add regression tests for serialization and shape/min/max metadata.

# Acceptance Criteria
- API endpoints return payloads matching Issue 01 examples.
- Tests validate schema, required fields, and sample content.
- Logging includes launch_id/grid keys for debugging.

# Dependencies / Notes
- Uses TracerV2 outputs (Issue 18).

## Implementation Plan
- Files: visualizer/v2/ir_builder.py (new), visualizer/v2/store.py, server routes/app for /api/data, /api/op/:uuid, /api/timeline, logging; tests tests/visualizer/test_ir_builder_v2.py, fixtures tests/fixtures/ir_v2_sample.json.
- Changes: assemble tracer records per launch/grid into V2 IR, compute deps/edges, summary stats, timeline frames; persist per-op tensors; feature-flag path; legacy endpoints untouched.
- Behavior: endpoints return spec-compliant JSON; include launch_id/grid in logs.
- Tests: schema validation against fixtures, deps/shape/stat checks, tensor fetch by uuid, flag-off path returns legacy.
