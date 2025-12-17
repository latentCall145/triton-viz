# STATUS: COMPLETED

# Title
Define V2 IR schema and API contracts

# Background
The new visualizer needs a structured, versioned IR that ties tracer output to UI interactions (code lines, graph nodes, op detail). We also need stable REST endpoints to serve this data to the frontend.

# Tasks
- Document V2 IR fields (launch, grid_idx, line_no, op_uuid, op_type, src span, deps, tensor metadata, loop stack, pid, timeline frame, memory space, stats).
- Specify JSON payloads for `/api/data` (versioned), `/api/run`, `/api/op/:uuid`, `/api/timeline`, and compatibility shims for legacy routes.
- Define failure modes and error payloads (missing op, out-of-range sliders, etc.).
- Add versioning/feature flags (e.g., `TRITON_VIZ_V2=1`) and fallbacks.
- Publish in-repo spec (`design/v2-plan.md`) consumable by FE and BE.

# Acceptance Criteria
- Written spec checked into repo and referenced path recorded here.
- Clear field types, required vs optional, and example payloads for each endpoint.
- Upgrade/downgrade story documented (legacy visualizer unaffected by default).
- Open questions explicitly listed (e.g., memory space detection rules, multi-launch handling).

Spec path: design/v2-plan.md

# Dependencies / Notes
- Wireframe in `design/wireframe.png`.
- Must align with tracer changes (see Issue 18) and FE needs (Issues 04–08).

## Implementation Plan
- Files: design/v2-plan.md (new); optionally update this issue footer with spec path.
- Changes: document V2 IR schema (launch/op/deps/tensors/loop stack/pid/memory/timeline/stats), versioning flag TRITON_VIZ_V2, endpoint payload examples (/api/data, /api/run, /api/op/:uuid, /api/timeline), failure modes, upgrade/downgrade story, open questions.
- Behavior: none (docs only); ensure naming aligns with tracer/builder.
- Tests: markdown/link lint; cross-check schema vs examples.
 - Notes: deps allow self-edge for read/modify/write patterns (e.g., `a += 3`); cycles longer than one should be warned as bugs.
 - Clarifications captured: ops array is ordered execution (timeline dropped); while loops store iter count + predicate (no bounds); memory spaces are cataloged per-launch (default hbm/sram/register/unknown but overridable); shapes are concrete ints even in symbolic mode (only data absent); outputs may differ from inputs; no grid_idx (pid only); op_site vs op instance terminology clarified.
