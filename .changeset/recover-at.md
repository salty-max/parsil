---
'parsil': minor
---

Add `recoverAt(p, sync)` for compiler-style multi-error parsing.

Try `p`. If it succeeds, yield `{ ok: true, value }`. If it fails, skip input character-by-character until a non-consuming match of `sync` would succeed (or end-of-input is reached), then yield `{ ok: false, error, index }`. The envelope **always succeeds** at the outer level — surrounding parsers keep going.

```ts
import { char, recoverAt, sepBy, str } from 'parsil'

const stmt = recoverAt(parseStatement, char(';'))
const program = sepBy(char(';'))(stmt)

const result = program.run('a; INVALID; b; c')
// result.result is an array of RecoveryResult<T>:
//   [{ ok: true, value: ... }, { ok: false, error, index }, ..., ...]
```

Pairs naturally with the structured `ParseError` shape from #24: collected failures carry full `parser` / `expected` / `actual` / `context` info. Use `formatParseError` to render each into a string for diagnostics, or branch on `error.parser` for tooling.

Edge cases handled: failure at end-of-input doesn't infinite-loop; a sync match at the failure position consumes nothing; sync never found before EOI cleanly walks to EOI.
