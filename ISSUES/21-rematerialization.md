# Title
Rematerialization mode for tracer to cut disk I/O

# Background
CPU tracing writes all intermediates, producing ~12GB for a 4096^2 run and stalling on disk I/O (violates <200% overhead). Instead of logging every tensor, we can store inputs once and log only minimal per-step metadata, letting the UI recompute tiles on demand. This fits V2 tracer/IR and keeps legacy untouched.

# Tasks
- Add rematerialization mode to TracerV2 (CPU path first). Gate via flag/constructor.
- Snapshot full inputs once (compressed binary) and avoid logging dense intermediates.
- Log minimal per-step metadata needed to reconstruct (e.g., step_id, m/n/k bases or loop indices); reuse existing loop_stack/pid where possible.
- Define on-disk artifacts: inputs.bin (or per-input files) + trace.json (step metadata), schema aligned with V2 run/launch metadata.
- Ensure schema compatibility: op_sites/ops still emitted; tensor data omitted except initial snapshots; mark remat mode in launch.flags.
- Add optional keyframes of outputs (e.g., every N steps) to speed random seeking; keep size bounded.
- Backend support to serve remat artifacts to FE; document format.
- UI helper spec: expose how Graph/Op/Tensor viewer can request remat playback (typed arrays/WASM).

# Acceptance Criteria
- Reference kernel (M=N=K=4096) artifacts <200MB total.
- Traced runtime <110% of untraced baseline on CPU path.
- Recomputed values in UI match full trace within 1e-4 tolerance.
- Legacy tracing unchanged when remat flag off.

# Dependencies / Notes
- Built on TracerV2 (Issue 18) and V2 schema; aligns with IR builder (03) and GPU tracer (20) but starts on CPU path.
- Requires storage format doc for FE/BE; precision handling (fp16/fp32) must be explicit.
- Keyframes optional; design with configurable interval.

## Implementation Plan
- Files: tracer_v2 remat module/helpers, serialization helpers, docs in design/v2-plan.md; tests in tests/visualizer/test_tracer_v2_remat.py; sample artifacts under tests/fixtures.
- Changes: add remat flag; snapshot inputs once; emit minimal step metadata; extend builder to surface remat artifacts and flags; keep legacy flow intact.
- Behavior: when remat on, skip dense tensor logging; ops still present with tensor metadata but `data` omitted; keyframes optional; remat flag surfaced in launch.flags.
- Tests: artifact size check on sample kernel, perf overhead vs baseline, reconstruction correctness vs full trace, flag-off regression.
