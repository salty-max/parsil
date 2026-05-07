---
'parsil': major
---

**Breaking: error model overhaul.** Primitive parsers now emit a structured `ParseError` object instead of a `ParseError @ index N -> X: msg` string. `Parser<T, E>` defaults to `Parser<T, E = ParseError>`.

```ts
type ParseError = {
  parser: string // 'char', 'str', 'regex', 'keyword', ...
  index: number
  message: string
  expected?: string
  actual?: string
  context?: string[] // outer-first, populated by `inContext`
}
```

### What's new

- `ParseError` type, `formatParseError(e)` display helper, and `parseError(parser, index, msg, extras?)` factory exported from the package root.
- `errorMap` callback receives the structured `ParseError` directly — branch on `error.parser` / `error.expected` / `error.actual` without regex-ing a string.
- New `inContext(label, p)` combinator that wraps a parser and pushes `label` onto the failure's `error.context` array on failure (outer-first). Complementary to `label(name, p)` (in #20): `inContext` wraps and preserves the inner error; `label` replaces. The display formatter renders context as `[outer > inner]` brackets.
- `choice` aggregates `expected` from each failing branch and reports them as `"Expected one of: a | b | c"`. It also surfaces the **furthest-progress** branch — the one that consumed the most input before failing — in the composite message.

### Migrating consumers

If you were treating `error` as a string:

```ts
// Before
const num = P.digits.map(Number).errorMap(({ error }) => `Bad number: ${error}`)

// After (option 1 — keep the string flow)
const num = P.digits
  .map(Number)
  .errorMap(({ error }) => `Bad number: ${P.formatParseError(error)}`)

// After (option 2 — read structured fields)
const num = P.digits.map(Number).errorMap(({ error, index }) => ({
  code: 'EXPECTED_NUMBER',
  parser: error.parser, // 'digits'
  expected: error.expected, // '[0-9]+'
  message: 'Expected a number',
  at: index,
}))
```

If you were custom-typing `Parser<T, MyError>`, nothing changes — your `errorMap` chain still produces `MyError`.

### Doc updates

- README: rewritten Error handling section covering `ParseError`, `errorMap`, `inContext`, `choice`'s expected-set + furthest-progress, the always-backtracks model, the coroutine throw caveat, and the English-only policy.
- New combinator `inContext` listed in the README API table.

### Notes

- The runtime cost of structured errors over strings is negligible: an extra object allocation on the failure path. Successful parses are unaffected.
- Custom parsers that you wrote against `Parser<T, E = string>` and that emit raw strings via `updateError(state, 'msg')` will produce a string in the `error` field; your downstream code may need to migrate. The recommended path is to use `parseError(parser, index, msg, extras?)` so your parser slots into the same display + introspection machinery as the built-ins.
