---
'parsil': minor
---

Add three quality-of-life utility helpers under `parsers/util/`. Closes the gap of small things consumers were hand-rolling on top of parsil.

**`linecol(input, index)`** — pure function

Convert a byte offset into a 1-based `{ line, col }` pair. Recognises `\n`, `\r\n`, and `\r` line endings (CRLF counted as one break). Useful for surfacing parsil errors in editor-style diagnostics.

```ts
linecol('foo\nbar\nbaz', 9) // { line: 3, col: 2 }
```

**`tap(fn)(p)`** — observe successes

Curried side-effect helper: run `fn(value, state)` on every successful parse and forward the result unchanged. `fn` is **never** invoked on failure, so it's safe to use for tracing or metrics without affecting parser semantics.

```ts
const traced = tap<number>((n, { index }) => console.log(n, '@', index))(intLit)
```

**`debugLog(label, p)`** — env-gated trace logging

Wrap a parser with enter/exit logging. Silent by default; activated via the `PARSIL_DEBUG` env var:

- `PARSIL_DEBUG='*'` — log all wrapped parsers
- `PARSIL_DEBUG='ident'` — log only `ident`
- `PARSIL_DEBUG='expr*'` — log labels starting with `expr`
- `PARSIL_DEBUG='a,b'` — comma-separated list

Output is a one-line-per-event format with `enter`, `ok`, `fail` markers — left in code without flooding production logs.
