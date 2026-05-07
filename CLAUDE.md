# Parsil — Claude Guidelines

## Project Overview

Parsil is a lightweight, dependency-free parser-combinator library for JavaScript and TypeScript. Small parsers compose into bigger ones via combinators (`sequenceOf`, `choice`, `many`, `recursive`, …) and run on either textual input (UTF-8 strings) or binary input (`ArrayBuffer`/`TypedArray`/`DataView`). Spans are first-class via `withSpan` / `spanMap`.

Parsil is the parser foundation for downstream projects (Gero asm, GTX language). Every change here can land in those consumers — favor stability, clear semantics, and well-documented edge cases over feature breadth.

What parsil **is**:

- A combinator kernel (`Parser<T>` class + a set of primitive parsers and combinators under `src/parsers/`)
- ESM-only, runs in Node ≥ 20, Bun ≥ 1.1, modern browsers
- Zero runtime dependencies

What parsil **is not**:

- A grammar generator (PEG.js, nearley) — there is no grammar file format
- A lexer/tokenizer toolkit — characters are the granularity by default
- An AST utility library — call sites build their own AST shapes

## Tech Stack

- **Bun** for tests, lint, and bundling
- **TypeScript** strict mode (no implicit `any` outside library boundaries)
- **ESLint** flat config + Prettier
- **bun build** (esbuild-backed) for the ESM bundle
- **tsc --emitDeclarationOnly** for `.d.ts`

Engines pinned in `package.json`: `node >= 20`, `bun >= 1.1`. Don't drop these without a major version bump.

## Source Layout

```
src/
├── parser/
│   ├── parser.ts          # Parser<T> class, ParserState, ResultType
│   └── index.ts           # Public re-exports
├── parsers/
│   ├── <name>/
│   │   ├── <name>.ts      # Implementation
│   │   ├── <name>-one.ts  # Variant (e.g. many-one, sep-by-one)
│   │   └── index.ts       # Barrel
│   └── index.ts           # Aggregated barrel
├── util/
│   ├── unicode.ts         # UTF-8 char width helpers
│   └── index.ts
├── input-types.ts         # InputType enum + isTypedArray
├── types.ts               # Shared TS utility types
└── index.ts               # Public API surface

tests/                     # Mirrors src/ — one spec per parser
├── parser/
└── parsers/
    └── <name>/<name>.spec.ts

dist/                      # Build output, never edited by hand
```

**Mirror rule**: every `src/parsers/<name>/<file>.ts` has a matching `tests/parsers/<name>/<file>.spec.ts`. Adding a new parser without a matching spec is a review blocker.

## Parser Design Principles

### Small, composable units

Each parser does **one** thing. If a combinator's body is more than ~40 lines or branches on more than a couple of state shapes, split it. The whole point of the library is that complex grammars emerge from composition — don't bake special cases into primitives.

### No hidden state

A parser is a pure function `state -> state`. Never close over module-level mutable state, never read from globals, never use `Date.now()` or `Math.random()` inside a parser body. The same input must always produce the same output. This is what makes `withSpan`, `lookahead`, and backtracking work.

### Carry types through

Every public parser is `Parser<T, E>` for a specific `T`. Avoid `Parser<any>` in exports — it leaks at every call site. Use TS variadic tuple types where possible (see `sequenceOf`'s tuple inference for the pattern).

### Use `coroutine` for readability

When a parser branches on intermediate results (e.g. peek a character, then dispatch to one of several sub-parsers), prefer `coroutine` over nested `chain` calls. The coroutine reads top-to-bottom; chains nest sideways. See `tests/parsers/coroutine/coroutine.spec.ts` for the canonical pattern.

### Source positions are not optional

Every grammar that targets diagnostics needs spans. Don't re-implement position tracking in user code — use `withSpan()` / `spanMap()` on the parser whose output you want located. Adding a new combinator? Make sure its result is reachable through `spanMap` (return values, not internal indices).

## Error Handling

### Two layers

1. **Library errors**: messages produced by primitive parsers (`char`, `regex`, etc.) follow the format `"ParseError @ index N -> <parser>: <description>"`. Don't change the format casually — downstream tooling regex-matches it.
2. **Consumer errors**: grammars built on top of parsil should call `.errorMap()` on every parser at a meaningful boundary (token, statement, expression) to attach a stable error code + human message. Never expose the raw `"ParseError @ index N -> str: ..."` to end users; map it.

### Never throw

Parsers signal failure via the result envelope (`isError: true`, `error`, `index`), not exceptions. The single exception is **construction-time validation** that's a programming error (e.g. `char('ab')` throws `TypeError` because the call signature is wrong — that's not a parse failure, it's a contract violation). Document throws with `@throws` in JSDoc.

### Test the failure path

Every parser spec must cover at least:

- Happy path
- One concrete failure (wrong input, wrong type)
- Edge cases: empty input, end-of-input, EOF mid-token

`assertIsOk` / `assertIsError` helpers in `tests/util/test-util.ts` keep specs concise.

## Imports

- **Relative inside `src/`** — `../../parser`, `../parsers/many`, etc. No path aliases (the package is small enough that aliases add machinery without payoff).
- **No deep imports across barrel boundaries** — consumers should only import from `parsil`. Inside `src/`, importing from a sibling parser's barrel (`../many`) is fine; reaching into a sibling's internal file (`../many/many-one`) is not.
- **No `default` re-exports** — every public symbol is a named export. The default export of `index.ts` is the namespace bundle and exists for ergonomics; don't proliferate defaults.
- Imports are auto-sorted by ESLint (`simple-import-sort`).

## Testing

- **Runner**: `bun test` (no Jest, no Vitest). The `bun:test` API (`describe`, `it`, `expect`) is the only test API.
- **Layout**: `tests/` mirrors `src/`. One spec per parser file.
- **Naming**: `<file>.spec.ts`, `describe('<parserName>', ...)`, `it('should <behavior>', ...)`.
- **Helpers**: `tests/util/test-util.ts` for `assertIsOk` / `assertIsError`. Don't invent per-spec helpers when a shared one exists.
- **No snapshot tests** for parser output — they encode noise (whole result envelopes) and rot fast. Assert on `result.result` and `result.index` explicitly.
- **Coverage** is not a target; **failure paths** are. A parser with 100% line coverage but no failure case is undertested.

## Branching

- `feat/<short-description>` — new combinator, new public API
- `fix/<short-description>` — bug fix
- `chore/<short-description>` — tooling, deps, CI, build
- `docs/<short-description>` — docs-only change
- `refactor/<short-description>` — internal restructuring with no behavior change

Branch from `main`. One issue → one branch → one PR. If a PR is growing past ~400 lines of diff, stop and split.

## Commit Convention

Conventional commits enforced by commitlint with a **strict scope-enum**. Scope is mandatory and must be in the allowed list (see `commitlint.config.mjs`).

### Scopes

```
parser              → the Parser class, ParserState, ResultType, run/fork
parsers/<name>      → a specific combinator under src/parsers/<name>/
util                → src/util/* (unicode, encoders)
deps                → dependency bumps
tooling             → husky, commitlint, lint-staged, knip, eslint, prettier, build scripts
ci                  → .github/workflows/*
docs                → JSDoc, README, in-source documentation
meta                → top-level repo files (CLAUDE.md, LICENSE, .gitignore, root configs)
```

### Examples

```
feat(parsers/sep-by): add sepByOne
fix(parsers/many): stop on EOI even when the inner parser succeeds with an empty match
refactor(parser): extract createParserState into its own module
chore(deps): bump typescript to 5.9.3
chore(tooling): enforce strict scope-enum in commitlint
docs(parsers/recursive): clarify when to use recursive vs lazy chain
meta: add CLAUDE.md with project conventions
ci: cache bun install across jobs
```

### Rules

- **No scope-less commits** (`feat: add x` → rejected).
- **Adding a new parser dir** under `src/parsers/<name>/`? Add `parsers/<name>` to the scope-enum in the same commit.
- **Multi-concern changes**: split into multiple commits in the PR. If you can't, the PR is doing too much.
- **No `Co-Authored-By: Claude` trailer.**
- **No AI attribution** in commit messages, PR titles, PR descriptions, or issue comments.
- **`fixup!` to address review feedback** — never standalone "fix review" or "address feedback" commits. Squash with `--autosquash` before merge.

## JSDoc on Exports

Every exported parser, combinator, helper, and type gets JSDoc. Keep it short:

- One-line description (what the parser does)
- `@param` with description per parameter (omit if the type alone is self-explanatory and the param name is clear)
- `@returns` describing the parser type and intent
- `@throws` only when construction can throw a `TypeError` (e.g. `char` rejecting non-single-character input)
- `@example` blocks **are encouraged** for parsers — unlike feature code, parsil examples are tiny snippets that double as documentation. Keep them to 2-4 lines, one input/output per example. The existing `char`, `sequenceOf`, `many` JSDoc set the bar.

```ts
/**
 * Match `parser` zero or more times, collecting results into an array.
 *
 * @example
 * const p = many(str('ab'))
 * p.run('ababxy')  // { isError: false, result: ['ab', 'ab'], index: 4 }
 *
 * @param parser The parser to apply repeatedly.
 * @returns A parser that always succeeds with an array (possibly empty).
 */
export const many = <T>(parser: Parser<T>): Parser<T[]> => { ... }
```

**Do not**:

- Add file-level JSDoc (the file name and exports speak for themselves)
- Document trivial private helpers — JSDoc is for the public surface
- Write `@example` blocks longer than 5 lines; if you need that, the test is the example

## Inline Comments

Comment **why**, not **what**. The code already shows what.

```ts
// Good — explains the why
// Width-2 chars never start with 0xFx; this branch handles the 4-byte case only.
if ((byte & 0xF8) === 0xF0) { ... }

// Bad — restates the code
const next = state.index + 1;  // increment index by 1
```

Rules:

- Single-line `//` comments only
- Comment a non-trivial block, not every line
- Skip comments on obvious code (simple assignments, mechanical conversions)

## Debug Code

`no-console` is enforced (warn level). `console.warn` and `console.error` are allowed for genuine library-level warnings. `console.log` and `debugger` are not — remove them before committing. CI fails on `--max-warnings 0` so a stray `console.log` blocks the merge.

## Self-Review Before Declaring Done

When you think the work on an issue is finished, **don't declare done immediately**. Run a self-review pass, fix what you find, and loop until the review is clean. The pass is short but mandatory:

### Checklist

1. **Acceptance criteria from the issue** — re-read the issue body. Has every bullet been addressed? If a criterion is intentionally deferred, note it in the PR description with a reason.
2. **Tests** — do they cover happy path, at least one failure, and the edge cases listed in the issue (empty input, EOI, etc.)? Run `bun test` locally and confirm green.
3. **Public API consistency** — does the new export follow naming conventions of neighbors? Same JSDoc shape? Re-exported from the right barrel?
4. **Lint + typecheck** — `bun run lint` and `bun run typecheck` clean. `--max-warnings 0` is enforced; no exceptions.
5. **No leftover scaffolding** — no `console.log`, no `// TODO` without an issue link, no commented-out code, no unused imports.
6. **Commit hygiene** — every commit has a valid scoped header; no fixup commits left unsquashed; no AI attribution anywhere.
7. **Diff scope** — the PR touches what the issue says it should and nothing else. Drive-by refactors go in their own PR.
8. **Docs** — README's API section and CLAUDE.md updated if the change affects consumers (new combinator → README; new convention → CLAUDE.md).

### Loop

If the pass finds issues, fix them and run the pass again — including re-running tests, lint, and typecheck. Keep looping until the review surfaces nothing. Only then mark the work as done and request review.

A pass that finds zero issues on the first try is suspicious — re-read the issue body once more before trusting it.

## Forbidden Patterns

```ts
// Bad — hidden mutable state
let lastIndex = 0
export const tokenized = new Parser((state) => {
  lastIndex = state.index
  ...
})

// Bad — throwing for parse failure
export const myParser = new Parser((state) => {
  if (!isValid(state)) throw new Error('bad input')
  ...
})

// Bad — leaking `any` in public API
export const sequence = (parsers: Parser<any>[]): Parser<any> => ...

// Bad — silent swallow of an unexpected error in a primitive
try {
  return decode(state)
} catch {
  return state  // silently returns input unchanged
}

// Bad — file-level JSDoc
/**
 * @file This file contains the many parser combinator
 */

// Bad — AI attribution in commit
chore(tooling): set up husky

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Key Rules Summary

1. **One concern per file** — split early
2. **Pure parsers** — no hidden state, no throw on parse failure
3. **Carry types** — never `Parser<any>` in exports
4. **Spans are first-class** — use `withSpan`/`spanMap`, don't reinvent positions
5. **Two-layer errors** — primitives produce raw messages, consumers map them
6. **Test the failure path** — happy + at least one failure per spec
7. **Mirror layout** — every `src/parsers/<name>/<file>.ts` has a `tests/parsers/<name>/<file>.spec.ts`
8. **Strict scope-enum** — every commit has a scope from the enum
9. **JSDoc on exports** — short description + params + returns; `@example` welcome on parsers
10. **No AI attribution** — never in commits, PRs, or issue comments
11. **Self-review loop** — run the checklist and fix until LGTM before declaring done
