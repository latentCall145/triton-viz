# AI contributor guidelines

- start with a 2–4 step plan; avoid scaffolding you don't need.
- match local style: read a sibling file first; follow PEP8, terse lowercase comments only when intent is non-obvious.
- minimize surface area: prefer editing existing functions over adding new ones; keep new code colocated and short.
- single-responsibility changes: don't mix refactors with new features.
- no premature abstractions: abstract only after the third use.
- keep dependencies at zero: use stdlib or existing helpers before adding packages.
- keep APIs small: narrow signatures, plain data returns, avoid option bloat.
- fail loudly and simply: clear exceptions; no retries/backoff unless required.
- tests follow features: add the smallest test proving behavior; avoid mega suites.
- re-read and shrink: delete lines until it would break; keep what's essential.
- comments are rare: inline and lowercase when intent isn't obvious. However, if comments already exist, don't lowercase them unless asked.
- optimize only when measured: prioritize correctness and clarity; optimize after evidence.
- no dead code: remove unused helpers, flags, and commented blocks.
- deterministic outputs: avoid randomness/time unless required; seed if unavoidable.
- clear ownership: when touching a module, summarize what changed and why in the PR/issue.
