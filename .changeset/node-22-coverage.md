---
'parsil': patch
---

Bump Node engine floor to `>=22` and Bun to `>=1.3`. Add test coverage reporting.

**Engine bump**

Node 20 enters maintenance later this year; 22 has been the LTS since October 2024. Bumping in v3.0.0 means the breaking-engine cost lands in the same release as the API breaks (#29) — no separate dot-release just for engines. Updated `package.json` `engines`, `release.yml` Node setup step (used by `npm publish`), and the README **Engines** line so the published constraints, the publish workflow, and the docs all agree.

**Coverage**

- `bun run test:coverage` produces a text summary in the console and an `lcov.info` file under `coverage/` (suitable for Codecov, IDE coverage gutters, etc.).
- A `coverage` job in `ci.yml` runs the script on every push and uploads the lcov as a 30-day artifact.
- `coverage/` added to `.gitignore`.
- No threshold gate yet — we establish a baseline and gate in a follow-up once the v3.0.0 cycle has settled.
