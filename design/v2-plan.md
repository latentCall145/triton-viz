# triton viz v2 ir & api spec

## goals
- stable schema for tracer/backends/frontend.
- versioned payloads; legacy viz remains default unless flagged.
- fields cover code ↔ graph ↔ op interactions.

## definitions (with kernel example)

Example kernel:
```python
@triton.jit
def kernel(A, B, C):
    pid = tl.program_id(0)
    for k in range(0, 4):
        a = tl.load(A + pid * 128 + k)
        b = tl.load(B + k)
        tl.store(C + pid * 128 + k, a + b)
```
- launch: one invocation of `kernel[...]`, owning all traced ops and source snapshot for that call.
- op_site: a static source span in the kernel (e.g., the `tl.load` line). An op_site can execute many times.
   - op instance (short: op): one execution of an op_site, annotated with pid tuple, loop context (`k` value)

## versioning & flags
- `version`: required top-level field, `2` for this spec.
- env flag: `TRITON_VIZ_V2=1` enables v2 tracer + builder + endpoints; `0` keeps v1 behavior.
- request opt-in: clients may send `?version=2` query; server falls back to v1 if absent.
- compatibility: v1 routes unchanged; v2 uses same paths with `version=2` or flag.

## data model

### launch object
- `launch_id` (string: unique per kernel launch.
- `kernel_name` (string).
- `created_at` (iso8601 string, optional).
- `flags` (object, optional): e.g., `{"symbolic": bool}`.
- `source` (object): `{ "file": str|null, "text": str, "version": str|null }`.
- `grid_dim` (object): `{ "x": int, "y": int, "z": int }` overall grid dimensions.
- `memory_spaces` (array of strings, optional): catalog of allowed memory labels for this launch. Default: `["hbm", "sram", "register", "unknown"]`.
- `op_sites` (array of op_site objects for static source spans; index is op_site_id).
- `tensors` (array of tensor objects; index is tensor_id).
- `ops` (array of op instance objects for this launch, ordered by execution; index can serve as op_id if UUID not needed by client).

### op_site object (static site)
- site ID implicit index in launch.tensors array
- `op_type` (enum string): load, store, dot, reduce, unary, binary, custom, etc.
- `line` (int) and `src_span` (object): `{ "file": str, "start": {"line": int, "col": int}, "end": {"line": int, "col": int} }`.
- `inputs` (object<string,int>): mapping arg name → launch.tensors index used as input.
- `outputs` (object<string,int>): mapping arg name → launch.tensors index produced by this site.
- `node_path` (array<string>, optional): nested logical grouping labels applied via tracer context manager; ordered outer→inner.
- `tensors` (object):
   - `inputs` (object<string,int>): indexes into launch.tensors keyed by arg name.
   - `outputs` (object<string,int>): indexes into launch.tensors keyed by arg name.

### tensor object
- tensor ID implicit index in launch.tensors array
- `site_ids` (object):
    - `from` (array<int>): op_site IDs that write this tensor.
    - `to` (array<int>): op_site IDs that consume this tensor.
- `name` (string): identifier within the op/site.
- `shape` (array<int>): concrete shape.
- `strides` (array<int>).
- `dtype` (string).
- `memory` (string): label from launch.memory_spaces.
- `stats` (object|null, optional): e.g., `{ "min": number, "max": number }`.

### loop object
- loop ID implicit index in launch.loops array
- `kind` ("for"|"while"): specifies if the loop is a for/while loop.
- `line` (int) and `src_span` (object): `{ "file": str, "start": {"line": int, "col": int}, "end": {"line": int, "col": int} }`.
- `lower` (int): lower bound for for loops, -1 for while loops
- `upper` (int): upper bound for for loops, -1 for while loops
- `step` (int): step increment for for loops, -1 for while loops
- `predicate` (str): the loop condition to be met in a while loop, empty string in for loops

### op instance object
- instance ID implicit index in launch.ops array
- `op_site` (int): references an entry in launch.op_sites.
- `pid` (object): `{ "x": int, "y": int, "z": int }` sampled pid for this instance.
- `loop_stack` (array ordered outer→inner): `array<{ "id": int, "value": int }>`
  - `id` (int): loop ID implied from launch.loops.
  - `value` (int): current loop counter value.
      - in for-loops, `value` starts from the loop's lower bound and increments by its step (e.g., never odd for range(0,10,2)).
      - in while-loops, `value` starts from 0 and increments by 1 each iteration.

## endpoints

### POST /api/run
- purpose: start a trace, enqueue compilation/execution, return run_id and launch_ids.
- body: `{ "source": str|None, "mode": "eager"|"symbolic", "version": 2, "flags": {"feature": bool} }`.
- response 200: `{ "run_id": str, "launch_ids": [str], "version": 2, "status": "queued"|"running"|"complete", "warnings": [str] }`.
- errors: `400 bad_request`, `422 unsupported_version`, `500 internal_error` (see failure payloads).

### GET /api/data
- purpose: fetch all launches for a run in one payload.
- query: `run_id` (optional, defaults to last), `version=2`.
- response 200: `{ "version": 2, "run_id": str, "launches": [launch], "schema": "v2" }`.
- legacy: without `version=2`, return v1 shape unchanged.

### GET /api/op/:id
- purpose: fetch one op instance plus its static site (and tensor data if running in eager mode).
- params: `id` path (op instance id AKA index into launch.ops); query `launch_id` required when multiple launches; optional `version=2`.
- response 200: object
    - `version` (int): 2
    - `launch_id` (str): launch ID.
    - `op` (int): op instance ID.
    - `op_site` (int): op site ID.
    - `inputs` (object<string, object>): map arg name → tensor details
        - `id` (int): tensor id,
        - `name` (string): identifier within the op/site.
        - `shape` (array<int>): concrete shape.
        - `strides` (array<int>): list of strides.
        - `dtype` (string): dtype.
        - `memory` (string): label from launch.memory_spaces.
        - `data` (serialized data|null): stored tensor data (serialized if kernel was traced in eager mode, null if symbolic).
    - `outputs` (object<string, object>): map arg name → tensor details with same shape as inputs


### failure payload (all endpoints)
```json
{"error": {"code": "not_found|out_of_range|bad_request|unsupported_version|internal_error", "message": "human readable", "detail": {"field": "optional context"}}}
```

## examples

### /api/data minimal
```json
{
  "version": 2,
  "run_id": "r1",
  "schema": "v2",
  "launches": [
    {
      "launch_id": "l1",
      "kernel_name": "matmul",
      "flags": {"symbolic": false},
      "source": {"file": "kernel.py", "text": "@triton.jit...", "version": "abc123"},
      "grid_dim": {"x": 2, "y": 1, "z": 1},
      "op_sites": [
        {
          "op_type": "load",
          "line": 42,
          "src_span": {"file": "kernel.py", "start": {"line": 42, "col": 5}, "end": {"line": 42, "col": 18}},
          "inputs": {"A": 0},
          "outputs": {"A_val": 1},
          "node_path": ["compute", "load_inputs"],
          "tensors": {"inputs": {"A": 0}, "outputs": {"A_val": 1}}
        }
      ],
      "tensors": [
        {
          "site_ids": {"from": [], "to": [0]},
          "name": "A",
          "shape": [128, 128],
          "strides": [128, 1],
          "dtype": "fp16",
          "memory": "hbm"
        },
        {
          "site_ids": {"from": [0], "to": []},
          "name": "A_val",
          "shape": [128, 128],
          "strides": [128, 1],
          "dtype": "fp16",
          "memory": "register",
          "stats": {"min": -1.0, "max": 1.0}
        }
      ],
      "loops": [
        {
          "kind": "for",
          "line": 41,
          "src_span": {"file": "kernel.py", "start": {"line": 41, "col": 1}, "end": {"line": 41, "col": 20}},
          "lower": 0,
          "upper": 4,
          "step": 1,
          "predicate": ""
        }
      ],
      "ops": [
        {
          "op_site": 0,
          "pid": {"x": 0, "y": 0, "z": 0},
          "loop_stack": [{"id": 0, "value": 0}]
        }
      ]
    }
  ]
}
```

### /api/op/:id
```json
{
  "version": 2,
  "launch_id": "l1",
  "op": 0,
  "op_site": 0,
  "inputs": {
    "A": {
      "id": 0,
      "name": "A",
      "shape": [128, 128],
      "strides": [128, 1],
      "dtype": "fp16",
      "memory": "hbm",
      "data": [[1, 2], [3, 4]]
    }
  },
  "outputs": {
    "A_val": {
      "id": 1,
      "name": "A_val",
      "shape": [128, 128],
      "strides": [128, 1],
      "dtype": "fp16",
      "memory": "register",
      "data": null
    }
  }
}
```

### /api/run response
```json
{"run_id": "r1", "launch_ids": ["l1"], "status": "queued", "version": 2, "warnings": []}
```

## compatibility & shims
- keep existing v1 `/api/data` and `/debug` responses intact when `version` absent.
- allow `Accept-Version: 2` or `?version=2`; otherwise serve v1.
- when v2 enabled but tracer/builder missing fields, fill with `null` and add warning.

## validation rules
- any fields in the data model not explicitly marked as optional are required.
- ids must be stable within run; op indexes should remain aligned with the ordered ops array.
- tensor ids referenced by op_sites and ops must exist within launch.tensors.
- memory labels must be in launch.memory_spaces when provided; otherwise accept default catalog.
