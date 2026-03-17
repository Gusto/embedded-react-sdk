# src/ Directory

## SDK Architecture

See root `CLAUDE.md` for the full architecture overview.

## Storybook-First Development

Build and test components in Storybook before integrating into flows.

- **No backend required** — Storybook runs standalone without ZenPayroll or gws-flows
- Start Storybook: `npm run storybook` (port 6006)
- Build all visual states: default, loading, error, empty, edge cases
- Verify each state renders correctly, then wire up real data

## No `!important` in Styles

NEVER use `!important` in CSS/SCSS files. Use proper CSS specificity instead.
