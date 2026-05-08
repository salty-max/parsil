---
'parsil': minor
---

Refactor `everythingUntil` and `everyCharUntil` onto a shared internal driver, lock down their byte-vs-char semantics with an explicit test matrix, and unify them under a single `mode`-based entry point.

**Internal driver**

The two parsers were previously composed (`everyCharUntil` mapped on top of `everythingUntil`), conflating byte-level collection with char-level intent. Both now share a `collectUntil(name, step, sentinel)` driver and contribute their own per-iteration step:

- byte step — yields `number[]`, exposing raw bytes (including UTF-8 continuation bytes) regardless of input shape.
- char step — advances by full UTF-8 codepoint width, yields a `string` of complete characters.

**Public API: `mode` option**

`everythingUntil` now accepts an optional second argument:

```ts
everythingUntil<T>(parser: Parser<T>, mode?: 'bytes'): Parser<number[]>
everythingUntil<T>(parser: Parser<T>, mode: 'chars'): Parser<string>
```

- `'bytes'` (default) — original semantics; returns raw byte values.
- `'chars'` — UTF-8 aware; returns the consumed prefix as a string.

`everyCharUntil(p)` is preserved as a thin alias for `everythingUntil(p, 'chars')` and is now marked `@deprecated`. It may be removed in a future major.

**Behavior table now backed by tests**

| Input shape                           | `mode: 'bytes'` (default)               | `mode: 'chars'`                           |
| ------------------------------------- | --------------------------------------- | ----------------------------------------- |
| `string` (ASCII)                      | `number[]` of byte values               | `string`                                  |
| `string` (multi-byte UTF-8)           | `number[]` including continuation bytes | `string` of complete chars                |
| `ArrayBuffer / TypedArray / DataView` | `number[]` of byte values               | UTF-8 decoded `string` (lossy if invalid) |

The 4 existing `tests/parsers/everything-until/` tests pass unchanged.
