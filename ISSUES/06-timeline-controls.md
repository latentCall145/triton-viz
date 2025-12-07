# Title
Timeline controls (play/pause/step/speed/scrub)

# Background
Graph view needs a simple execution timeline: play/pause, step, scrub bar, and speed slider as shown in the wireframe.

# Tasks
- Define frame structure (sequence of op uuids per tick) in IR; hook to controls.
- Implement play/pause, step forward/back, scrub bar, and speed multiplier.
- Keyboard shortcuts: space (play/pause), arrows (step).
- Emit events to Graph view to highlight active nodes/edges.
- Persist last position per launch; reset on new run.

# Acceptance Criteria
- Timeline animates sample IR; speed slider affects playback rate.
- Scrubbing updates graph highlighting smoothly; no desync with selection.
- Keyboard shortcuts work and are documented in UI tooltip.

# Dependencies / Notes
- Frames supplied by IR builder (Issue 03). Integrates into Graph tab (Issue 05).

## Implementation Plan
- Files: web/timeline/Controls.tsx, web/timeline/state.ts, keyboard hooks; styles.
- Changes: play/pause, step ±1, scrub bar, speed slider; keyboard shortcuts (space, arrows); dispatch events to Graph/Op; persist last position per launch; reset on new run.
- Behavior: smooth scrubbing updates graph highlighting; speed multiplier affects tick rate.
- Tests: state transitions, speed effect, keyboard shortcut handling, persistence reset.
