# Agent instructions

- **Always run the test suite before pushing.** Run `npm test` (or `node --test`) and confirm everything passes before any `git push`. Never push with failing or skipped tests.
- **Always write tests for new functionality.** Any new Netlify Function, auth/token logic, or behavior that could regress silently (e.g. content gating, caching, race conditions) needs a corresponding test in `tests/`, using Node's built-in `node:test` + `node:assert/strict` (no new dependencies).
- If a change touches what content ships to the client vs. what stays server-side behind auth, update `tests/no-leak.test.js`'s expectations too — that test is the regression guard against private wedding details leaking into the static `index.html` bundle.
