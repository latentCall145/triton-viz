# Title
GPU-accelerated tracer (eager mode)

# Background
CPU-side tracing is too slow: kernels take ~3.5s on CPU and Python loop overhead dominates. On the RTX 3060 Mobile the same kernel runs ~0.015s; even with ~0.85s PCIe transfer for 6.4GB and ~2s NVMe writes, end-to-end tracing can stay under ~2.5s (<200% of CPU baseline) if we stream. We need a GPU-first tracer that records on-device and streams to disk without blocking compute.

# Tasks
- Build a GPU tracer path (eager mode) in TracerV2 that records tensors/ops on device and streams to host.
- Implement pinned (page-locked) host buffers and async DMA transfers; avoid paged copies.
- Add double ring buffers: fixed VRAM circular buffer + matching pinned RAM buffer to prevent OOM and allow overlap.
- Pipeline compute → device buffer → async copy → disk writer thread; minimize CPU wakeups.
- Stream to disk with mmap-friendly layout for UI; document format and size bounds.
- Ensure tracing does not alter kernel semantics; fall back to CPU tracer when flag disabled/unsupported.
- Add metrics/timing hooks to measure compute, copy, and disk stages.
- Tests/benchmarks on RTX 3060 Mobile (or similar) validating overhead target and correctness.

# Acceptance Criteria
- GPU tracer produces V2-compliant traces (ops/tensors) usable by IR builder/FE.
- End-to-end traced run stays within 2.5s for the provided kernel scenario (<200% CPU baseline) with evidence from benchmarks.
- Ring buffers prevent OOM; no unbounded allocations during long runs.
- Falls back to CPU tracer when GPU path unavailable or flag off.
- Streaming artifacts on disk are mmap-readable by the UI without full load.

# Dependencies / Notes
- Depends on TracerV2 (Issue 18) and V2 schema; integrates with IR builder (Issue 03).
- Coordinate disk format with backend/FE consumers; keep legacy tracer untouched.
- Focus on eager mode; symbolic can stay CPU for now.

## Implementation Plan
- Files: tracer_v2 gpu module (e.g., `triton_viz/clients/tracer/tracer_v2_gpu.py`), shared buffer utils, benchmarks under `benchmarks/tracer_gpu.py`, tests under `tests/visualizer/test_tracer_v2_gpu.py`.
- Changes: add pinned-host + device ring buffers, async copy streams, disk writer, flag gating; wire serialization to V2 payloads; add perf logging.
- Behavior: default to CPU tracer; enable GPU path via flag/env/constructor; ensure identical semantics with added `node_path`/metadata preserved.
- Tests: correctness against CPU tracer outputs on small kernels, stress test buffer rollover, perf benchmark capturing compute/copy/disk timings.
