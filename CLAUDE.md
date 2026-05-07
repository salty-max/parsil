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

`Parser<T, E>` defaults `E = string`, parsil's de facto error convention. Consumers using a structured error (e.g. `AsmError` in Gero) override it explicitly. Heterogeneous parser arrays (`choice`, `sequenceOf`) are constrained as `Parser<unknown, unknown>[]` — variance-equivalent to `Parser<any, any>[]` but more honest. `fail<E>(error)` returns `Parser<never, E>` because it can never produce a result.

**The one documented `any` left in the codebase** is on `StateTransformerFn`'s input state: `(state: ParserState<any, any>) => ParserState<T, E>`. Tightening it to `unknown` cascades into ~25 cast sites at every parser's `if (state.isError) return state` early-exit. The unsafety is contained — a parser may only forward `state` when it has not produced its own result. The trade-off is documented inline in `src/parser/parser.ts`. Don't add new `any` outside this boundary; if you find one, fix it instead of mirroring it.

**The one documented `as` cast** is in `src/parsers/sequence-of/sequence-of.ts`: an accumulator `unknown[]` cast to the tuple-mapped result type `{ [K in keyof T]: ... }`. TypeScript can't derive that mapping from a heterogeneous loop. The cast is contained, sound, and commented. New combinators that need similar tuple-mapped output should follow the same `unknown[]` + final cast pattern rather than introducing `any`.

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

- **Path alias inside `src/`** — every cross-directory import in `src/` uses the `@parsil/*` alias mapped in `tsconfig.json` to `./src/*`. Relative imports (`./`, `../`) are forbidden in `src/` and the custom ESLint rule `custom/no-relative-imports` autofixes violations to the equivalent alias.

  ```ts
  // Good
  import { Parser, updateResult } from '@parsil/parser'
  import { many } from '@parsil/parsers/many'

  // Bad — autofix flips this to '@parsil/parser'
  import { Parser } from '../../parser'
  ```

- **Tests are exempt** — `tests/` lives outside `src/` and imports the public surface via a relative path (`'../../../src'`). The alias rule only applies to `src/`.
- **No deep imports across barrel boundaries** — public consumers only import from `parsil`. Inside `src/`, importing from a sibling's barrel (`@parsil/parsers/many`) is fine; reaching into a sibling's internal file (`@parsil/parsers/many/many-one`) is not — go through the barrel.
- **No `default` re-exports** — every public symbol is a named export. The default export of `index.ts` is the namespace bundle and exists for ergonomics; don't proliferate defaults.
- Imports are auto-sorted by ESLint (`simple-import-sort`, configured in #5).

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

This section is **non-negotiable**. When you think the work on an issue is finished, **don't declare done immediately**. Run a self-review pass, fix what you find, and loop until the review is clean.

> **The known failure mode** is treating green CI as proof of done. Lint clean + typecheck clean + tests green is **necessary but not sufficient**. Issues list explicit acceptance criteria that go beyond CI: docs updates, type tests, downstream consumer impact, `.d.ts` diff inspection, changesets. Skipping these is the failure to guard against.

### Step 1 (do this first): re-open the issue body

Re-read **every** acceptance criterion line by line, in order. For each one, answer one of:

- ✅ Done — note where in the diff it's addressed.
- ⏭️ Deferred — note explicitly in the PR description, with a reason and a follow-up issue if appropriate.
- ❌ Missed — fix it before proceeding.

Don't paraphrase the criteria. Don't merge them in your head. Walk the list as the issue author wrote it.

### Step 2: technical gates (necessary)

- `bun run lint` clean with `--max-warnings 0`. No exceptions.
- `bun run typecheck` clean.
- `bun test` green — covers happy path, at least one failure, and the edge cases the issue lists (empty input, EOI, etc.) for new combinators.
- `bun run knip:check` clean.
- `bun run build` produces a clean ESM bundle and `.d.ts`.

### Step 3: explicit acceptance checks (don't skip)

- **Public API impact** — `.d.ts` diff against `main` inspected if the change touches public types. No `any` leaks; tightened generics documented.
- **Downstream consumers** — if parsil's API contract changes, check known consumers (Gero asm parser at `/Users/max/dev/gero_2.0/packages/asm/src/parser/`) and call out adjustments in the PR description.
- **Docs** — README's API section updated for new public combinators. CLAUDE.md updated for new conventions.
- **Type tests** — when the change tightens generic constraints, add a compile-time assertion under `tests/parser/types.spec.ts` so a regression fails CI.
- **Changeset** — added at the appropriate level (patch/minor/major) for `feat`/`fix`/`perf`/breaking PRs. Skipped only for `chore`/`docs`/`test`/`refactor` (internal-only)/`ci`/`build`/`style`. When in doubt, add one.

### Step 4: hygiene

- No leftover `console.log`, `debugger`, commented-out code, unused imports, or `// TODO` without a linked issue.
- Every commit has a valid scoped Conventional-Commit header.
- No `Co-Authored-By: Claude` trailers, no AI attribution anywhere.
- Diff scope matches what the issue says it should — drive-by refactors go in their own PR.
- Fixup commits are either auto-squashed locally or the PR is set up for squash-merge.

### Loop

If any step finds an issue, fix it and run **all four steps again** — not just the failing one. Tests can pass on Wednesday and break on Thursday because of an autofix change you didn't notice. Re-run end to end.

Stop only when all four steps surface zero items.

A first-try clean pass is suspicious — re-read the issue body once more before trusting it.

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
8. **`@parsil/*` alias in `src/`** — no relative imports in source files; ESLint autofixes violations
9. **Strict scope-enum** — every commit has a scope from the enum
10. **JSDoc on exports** — short description + params + returns; `@example` welcome on parsers
11. **No AI attribution** — never in commits, PRs, or issue comments
12. **Self-review loop** — run the checklist and fix until LGTM before declaring done
