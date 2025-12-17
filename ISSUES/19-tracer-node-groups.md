# Title
Tracer node grouping context

# Background
Complex kernels can overwhelm the graph view. We need a lightweight way for authors to group related ops so the UI can render collapsible subgraphs. A tracer-side context manager should tag ops with nested grouping labels without changing execution.

# Tasks
- Add a `tracer.node(label)` context manager (nestable) that tags enclosed ops with an ordered `node_path`.
- Emit `node_path` on op_site (static site) records in TracerV2 and propagate through serialization.
- Update V2 schema/docs (design/v2-plan.md) to include optional `node_path` on op_site.
- Add tests for nested contexts, empty/default behavior, and ensure tracing behavior is otherwise unchanged.

# Acceptance Criteria
- Ops recorded inside nested node contexts carry the full `node_path` (outer→inner) in the V2 payload.
- Tracing output is identical to no-context run aside from added `node_path` metadata.
- UI/backends can consume `node_path` to render collapsible groups (no schema drift).

# Dependencies / Notes
- Builds on TracerV2 (Issue 18) and updated V2 schema.
- Coordinate with graph view (Issue 05) when rendering, but implementation can start immediately.

## Implementation Plan
- Files: tracer_v2 client module, shared tracer utils, tests under tests/visualizer/test_tracer_nodes.py.
- Changes: implement context manager for grouping, store nested labels on op_site, extend serializers/fixtures; keep legacy tracer unchanged.
- Behavior: when context absent, `node_path` omitted/null; when nested, order preserved.
- Tests: nested grouping, mix of grouped/ungrouped ops, ensure node context is metadata-only (no behavioral effect).
