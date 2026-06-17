# Contributing

Thanks for considering a contribution. This project is small, but is kept tidy
to make changes painless.

## Local setup

```bash
npm ci
npm run dev      # Vite dev server with HMR
npm test         # Run the test suite once
npm run lint     # ESLint
npm run format   # Prettier (write)
```

## Branching

- Branch from `main`.
- Use short, descriptive branch names — e.g. `fix/rotweek-anchor-drift`,
  `feat/icalendar-export`.

## Pull requests

1. Ensure `lint`, `format:check`, `test` and `build` all pass.
2. Keep PRs focused — one concern per PR makes review easier.
3. Update documentation (README, JSDoc) when behaviour changes.
4. Include before/after screenshots for visual changes.

## Commit messages

Follow the **Conventional Commits** convention where practical:

```
feat: add iCalendar export
fix: clamp block onDays to a minimum of 1
chore: bump Vite to 5.4.6
```

## Code style

- Modern ES modules, no transpilation step beyond what Vite handles.
- Keep domain logic (in `src/modules/dates.js`, `schedule.js`, `presets.js`)
  pure and easily testable. View code in `views.js` and event wiring in
  `main.js` owns all DOM access.
- Prefer small, readable functions over clever one-liners.

## Reporting bugs

Please use the **Bug report** issue template and include a reproduction
recipe — even a numbered list of clicks helps a lot.
