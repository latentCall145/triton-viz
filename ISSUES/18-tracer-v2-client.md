# Title
TracerV2 client with V1 parity

# Background
V2 IR/schema requires a dedicated client that emits versioned payloads without mutating the existing Tracer. We need a TracerV2 that mirrors current Tracer behavior while populating the V2 launch/op/tensor shapes for the new endpoints.

# Tasks
- add a TracerV2 client (separate class/module) that shares core helpers with Tracer but defaults to version=2 payloads and TRITON_VIZ_V2 gating.
- keep public API parity (start/run callbacks, arg/grid hooks, record collection, serialization) so callers can switch by flag without code changes.
- emit launch/op_site/tensor/op structures matching the V2 data model: memory_spaces catalog, site/tensor ids, src spans, pid, loop_stack, loops array, tensor stats.
- serialize responses for /api/run, /api/data, and /api/op/:id with version=2, schema=v2, and warnings support while leaving V1 serialization intact.
- add tests comparing Tracer and TracerV2 outputs on the same kernels in eager and symbolic modes; cover flag-off fallback and flag-on V2 shape validity.

# Acceptance Criteria
- TracerV2 produces schema-valid V2 payloads that the IR builder/backends ingest without adjustments.
- switching from Tracer to TracerV2 via flag/constructor requires no caller-side API changes.
- V1 tracer behavior and outputs remain unchanged when TRITON_VIZ_V2 is off.
- integration tests confirm /api/run, /api/data, and /api/op/:id return version=2 shapes when TracerV2 is active.

# Dependencies / Notes
- align strictly with `design/v2-plan.md` data model and endpoints (source of truth).
- coordinates with Issue 01 (IR API spec) and Issue 03 (IR builder/backends); Symbolic flow in Issue 17 must also work with TracerV2.

## Implementation Plan
- Files: new client under `triton_viz/clients/tracer` (e.g., tracer_v2.py) plus shared helpers; tests in `tests/visualizer/test_tracer_v2_client.py`.
- Changes: factor shared utilities from `triton_viz/clients/tracer/tracer.py` as needed, implement TracerV2 with V2 schema emission, gate selection via TRITON_VIZ_V2 env/constructor flag, ensure serialization outputs version/schema/warnings fields per endpoints.
- Behavior: when flag on or client explicitly chosen, V2 payloads produced; when off, legacy Tracer path remains default and untouched.
- Tests: parity snapshots vs Tracer for core ops, validation against V2 schema, flag toggling, eager vs symbolic tensor data presence.
