# Title
Op visualization: Dot / Matmul

# Background
Dot ops require a dedicated view showing tiles of A/B and accumulation of C across K with timeline/step control.

# Tasks
- Render A and B tiles and resulting C tile; animate accumulation over K using precomputed partials.
- Sync with timeline frames: highlight current k-step and resulting C values.
- Support different tile sizes and strides; show shapes/dtypes.
- Provide controls to jump to specific (row, col) and inspect partial sum.

# Acceptance Criteria
- Sample matmul shows correct partial sums per step; C updates when timeline advances.
- Selecting (row, col) displays running total; A/B elements highlighted for that multiply.
- Handles 2D tiles; degrades gracefully for higher dims.

# Dependencies / Notes
- Needs precomputed partials from backend (Issue 03) and timeline (Issue 06).

## Implementation Plan
- Files: web/op/dot/DotView.tsx, timeline hook, styles.
- Changes: display A/B tiles and C accumulation animation over K tied to timeline; row/col inspector showing running total; highlight current k-step elements; handle varying tile sizes/strides.
- Behavior: updates with timeline ticks; selection shows partial sums; degrade gracefully for higher dims.
- Tests: sample matmul partial progression, inspector correctness, timeline sync.
