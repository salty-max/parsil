---
'parsil': patch
---

Refactor `everythingUntil` and `everyCharUntil` onto a shared internal driver and lock down their byte-vs-char semantics with an explicit test matrix.

The two parsers were previously composed (`everyCharUntil` mapped on top of `everythingUntil`), conflating byte-level collection with char-level intent. Both now share a `collectUntil(name, step, sentinel)` driver and provide their own per-iteration step:

- `everythingUntil` uses a **byte step** — yields `number[]`, exposing raw bytes (including UTF-8 continuation bytes) regardless of input shape.
- `everyCharUntil` uses a **char step** — advances by full UTF-8 codepoint width, returns a `string` composed of complete characters.

Behavior table now covered by tests:

| Input shape                           | `everythingUntil`                       | `everyCharUntil`           |
| ------------------------------------- | --------------------------------------- | -------------------------- |
| `string` (ASCII)                      | `number[]` of byte values               | `string`                   |
| `string` (multi-byte UTF-8)           | `number[]` including continuation bytes | `string` of complete chars |
| `ArrayBuffer / TypedArray / DataView` | `number[]` of byte values               | UTF-8 decoded `string`     |

Public API is unchanged. The only observable shift: a failing `everyCharUntil` now reports `error.parser === 'everyCharUntil'` instead of `'everythingUntil'`, which is more accurate.
