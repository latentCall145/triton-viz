# tracer v2 plan (issue 02)

## scope
- tracer-side data collection only.
- no ir builder or api changes yet.

## decisions (from discussion)
- v2 gating: config property, default true; no env var.
- logging: simple print ok; tracer init is fine.
- v2 tracer emits v2 records only when v2 enabled; v1 tracer unchanged.
- program id: use current grid idx.
- loop tracking: for-loops only.
- loop bounds: assume concrete ints.
- loop ids: nesting order per execution.
- source span: absolute file path, line + columns.
- timeline: single monotonic t starting at 0.
- memory tag: use "unknown" for tl.load return values; kernel args are hbm.
- memory tag applies to tensors only; op_site should not carry memory.
- grid filter: single tuple (pid_x, pid_y, pid_z); skip non-matching ops but emit grid marker.
- no multi-grid filtering for now.
- tests: ok to run in interpret mode without gpu.

## required spec updates
- remove op_site.memory from design/v2-plan.md.

## implementation notes
- add v2 tracer client (separate from existing tracer).
- extend data model for v2 records without changing v1 dataclasses.
- emit v2 records with pid, loop stack, src span, timeline t, memory tags on tensors.
- ensure v2 tracer gated by config flag; v1 tracer unaffected.
- add unit tests covering loop indexing, pid, memory tagging, grid filter, v1 compatibility.
