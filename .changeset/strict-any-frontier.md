---
'parsil': major
---

**BREAKING:** Tighten the `StateTransformerFn` boundary. The last `any` in parsil's public type surface is gone — input states now carry typed `unknown` for the result slot and a generic `E` for the error slot.

```ts
// Before
type StateTransformerFn<T, E = ParseError> = (
  state: ParserState<any, any>
) => ParserState<T, E>

// After
type StateTransformerFn<T, E = ParseError> = (
  state: ParserState<unknown, E>
) => ParserState<T, E>
```

Why this is breaking: any consumer that passed a parser into a context expecting `ParserState<any, any>` (notably TS code that relied on `any`'s structural-everything assignability) will see a type error. In practice this is rare — the only consumers that hit it are those writing their own state transformers by hand, which is itself unusual.

**New helper:** `forward<E>(state: ParserState<unknown, E>): ParserState<never, E>` centralizes the cast every parser does in its early-exit branch:

```ts
new Parser((state) => {
  if (state.isError) return forward(state) // was: return state
  // ... rest of the parser
})
```

`never` for the result slot lets the forward branch unify with any successful return type without needing a parser-specific annotation.

**Other strictness improvements landed in the same pass:**

- `updateError` now returns `ParserState<never, E2>` (not `ParserState<T, E2>`) — failure narrows the result slot to `never`, mirroring the model that a failed parser cannot have produced a value.
- Curried separation combinators (`sepBy`, `sepEndBy`, `endBy`) defer their `V` generic to the second curried call so call-site inference flows cleanly without explicit annotation: `sepBy(comma)(letters)` now yields `Parser<string[], ParseError>` instead of `Parser<unknown[], ParseError>`.
- `position`'s `index` parser is typed `Parser<number, ParseError>` (not `Parser<number, never>`) so it composes via `then` / `chain` with the rest of the library.
- `sequenceOf` and `choice` carry `E` generically through their array constraints — `Parser<unknown, E>[]` instead of `Parser<unknown, unknown>[]`.
- Tests are now part of the typecheck pipeline (`tsconfig.tests.json` + `bun run typecheck`), so type-level regressions in tests fail CI instead of silently slipping through.
- `tests/parser/types.spec.ts` carries an `IsAny<T>` compile-time assertion that breaks if `any` reappears at the `StateTransformerFn` boundary.

Public exports added: `forward`, `StateTransformerFn` (the type was internal before).
