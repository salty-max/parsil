---
'parsil': patch
---

Internal type tightening: replace structural `any` with `unknown`/`never` at API boundaries.

- `Parser<T, E = any>` and `StateTransformerFn<T, E = any>` now default to `E = string`, which matches parsil's de facto error convention. Consumers that use a structured error type override it explicitly.
- `fail<E>(error)` now returns `Parser<never, E>` (was `Parser<any, E>`) — accurately reflects that `fail` never produces a result.
- `choice` and `sequenceOf` constraints tightened: parser arrays accept `Parser<unknown, unknown>` instead of `Parser<any, any>`. Variance-equivalent in this position.
- `sequenceOf`'s internal accumulator typed as `unknown[]` instead of `any[]`. The single remaining cast (`results as ResultTuple`) is required because TypeScript cannot derive the tuple-mapped result type from a heterogeneous loop; documented inline.
- Removed two `as any` casts (`position.ts`, `parser.ts:withSpan`) by narrowing more precisely where possible.

The `state: ParserState<any, any>` parameter on `StateTransformerFn` is **kept** intentionally — tightening it to `unknown` cascades into ~25 cast sites in user-facing parsers. The boundary `any` is documented inline.

No runtime behavior changes. Type-level changes are subtle and most consumers won't notice; if your code relied on the old `Parser<T, any>` default, set `E` explicitly.
