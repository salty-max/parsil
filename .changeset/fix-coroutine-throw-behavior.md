---
'parsil': patch
---

`coroutine` no longer leaks raw `Error` instances out of `parser.run(...)`. Two changes:

- A non-Parser argument to `run(...)` inside a coroutine body (e.g. `run(42)` or `run(undefined)`) now produces a parse failure with a `ParseError @ index N -> coroutine: 'run' must be called with a Parser, got ...` message, instead of throwing a raw `Error` past the result envelope.
- Any other thrown value in the coroutine body that isn't a `ParserState` (typically a programming bug — a thrown `Error`, a string, etc.) is converted into a parse failure with `ParseError @ index N -> coroutine: <message>`. Parser-failure envelopes thrown by sub-parsers are still re-surfaced as failures unchanged.

Net result: `parser.run(...)` always returns a `ResultType<T, E>` for `coroutine`-built parsers, matching the rest of parsil's contract.

JSDoc also updated: the previous example used `yield` as a parameter name (a JS reserved word — wouldn't compile), and didn't show `run` as the convention. Renamed to `run` with a working example.
