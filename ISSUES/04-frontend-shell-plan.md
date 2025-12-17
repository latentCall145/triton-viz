# frontend shell work tree & implementation plan

## scope
- replace landing page with spa shell while keeping `/debug` legacy.
- right pane hosts graph/op embeds; left pane is read-only editor with line highlight + click events.
- split layout with draggable gutter; persist gutter width + active tab in localStorage.

## file map
- `triton_viz/templates/index.html`: new spa markup mounting shell; keep `/debug` unchanged.
- `triton_viz/static/shell/layout.css`: shared css variables, layout, tabs, gutter, pane styles.
- `triton_viz/static/shell/main.js`: bootstrap; load state; wire tabs, split, editor, panes.
- `triton_viz/static/shell/state.js`: in-memory state + localStorage load/save; simple subscriber hooks.
- `triton_viz/static/shell/tabs.js`: render tab bar, handle tab clicks, emit tab change.
- `triton_viz/static/shell/split.js`: gutter drag logic; apply widths; persist on release.
- `triton_viz/static/shell/editor.js`: codemirror wrapper (read-only, syntax highlight, line highlight, click emit).
- `triton_viz/static/shell/paneHost.js`: manage graph/op host divs; swap visibility; allow embed injection/iframe helper.
- `triton_viz/static/shell/api.js`: fetch `/api/data` (v2 first, v1 fallback); normalize code text; stub fallback text.
- `triton_viz/static/vendor/codemirror/...`: bundled esm + css for editor (no npm/cdn).

## behaviors
- default tab graph; remember last via `localStorage.tviz:lastTab`.
- left/right widths default 50/50; gutter drag updates inline width; clamp ~25–75%; persist `tviz:leftWidth` as percent.
- editor always renders text (fallback stub); read-only; line numbers; highlight clicked line and emit `{line,text}` event.
- selection events broadcast so graph/op placeholders can react; panes swap instantly without reload.
- right pane provides slots: `#graph-pane`, `#op-pane`; placeholder content now; ready for future embeds or sandboxed iframe.
- keep dark theme feel; define css vars for colors, gutter, font; no external fonts unless already in repo.

## steps to implement
1) scaffold template: rewrite `templates/index.html` to include `layout.css`, root `#app`, tab bar, split panes, gutter, script `shell/main.js`; leave `debug.html` untouched. ensure static paths correct.
2) add `layout.css`: base reset, css vars, flex split, gutter states, tab bar styles, pane placeholders, editor host sizing.
3) state layer: `state.js` with `loadState`, `saveState`, `subscribe`, setters (`setTab`, `setLeftWidth`, `setCode`, `setSelection`). initialize defaults if storage empty.
4) tabs: `tabs.js` builds two buttons (graph/op), adds active class + indicator, registers click to call `setTab` + persist.
5) split: `split.js` attaches pointerdown/move/up on gutter; computes percent width relative to container; applies style to panes; persists on release; add resize handler to reapply.
6) editor: vendor codemirror assets; `editor.js` exports `createEditor({mountEl,text,onSelect})`, `highlightLine(n)`, `setText(str)`; read-only, python mode, line numbers; click selects line and notifies state.
7) pane host: `paneHost.js` toggles pane visibility on tab change; exposes `render(tab, nodeOrHtml)` and `show(tab)`; placeholder content to verify swapping; optional `injectIframe(url)` helper for external html/js.
8) api wiring: `api.js` fetches `/api/data?version=2`, fall back to `/api/data`; extract `kernel_src` or `source.text`; return normalized object; handle fetch failure with stub code string.
9) main bootstrap: `main.js` loads state, draws tabs, split, editor, panes; pulls code via `api.js`; applies saved tab/width immediately to avoid flicker; subscribes to selection to forward to pane hosts (stub hooks).
10) manual checks: load `/` default graph, gutter works + persists, tab persists, editor highlights on click, no console errors when api missing, `/debug` untouched.

## ready-for-intern notes
- no build step: plain esm modules loaded via `<script type="module">` from `static/shell`.
- keep new files small and flat; no classes unless necessary.
- prefer inline lower-case comments only for non-obvious logic.
- ensure localStorage keys cleared safely (guard JSON parse).
