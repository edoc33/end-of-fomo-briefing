# End of FOMO — Press Briefing

A press briefing on the rise of information agents and the page monitoring agents that sit underneath them. Built as a self-contained HTML deck (no build step, no dependencies).

## Files

- `index.html` — the press briefing (primary deck)
- `press-briefing-print.html` — print-optimized variant
- `one-pager.html` — single-page summary
- `one-pager-print.html` — print-optimized one-pager
- `styles.css`, `design-tokens.css` — Visualping design system styles
- `deck-stage.js` — slide-stage scaling logic
- `assets/` — illustrations, logos, supporting imagery
- `fonts/` — Satoshi Variable

## Live

Hosted via GitHub Pages on the `main` branch.

## Source

Designed via Claude Design (claude.ai/design). Exported as a handoff bundle and deployed here as a static site. Press date: May 21, 2026.

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
