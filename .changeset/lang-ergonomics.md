---
'parsil': minor
---

Add language ergonomics helpers under `parsers/lang/`. Centralizes common building blocks that every DSL grammar (Gero asm, GTX, future hand-rolls) ends up writing.

**Literals**:

- `identifier` — `[A-Za-z_][A-Za-z0-9_]*`
- `stringLit(quote?)` — quoted string with conventional backslash escapes (default quote: `"`; pass `'` for single-quoted)
- `intLit` — optional sign + digits, yields `number`
- `floatLit` — optional sign + digits + optional fraction + optional exponent (at least one of fraction/exponent must be present)
- `signed(p)` — wrap a number parser to optionally accept a leading `+`/`-` sign

**Error-shaping**:

- `label(name, p)` — **replaces** the inner error with `Expected <name>`. Drops noise.
- `expect(p, msg)` — replaces `error.message` while keeping `parser` identity. Lighter touch than `label`.

**Composition**:

- `tag(value)(p)` — replace the result with a constant
- `apply(p1, p2, ..., fn)` — run 2 to 5 parsers in sequence and combine via `fn(...)`. Shorthand for `sequenceOf([...]).map(...)`.

```ts
const assign = apply(identifier, tok(char('=')), intLit, (name, _, value) => ({
  name,
  value,
}))
assign.run('age = 42') // { name: 'age', value: 42 }
```

`label` is the wrap-style complement of `inContext` (from #24): `inContext` keeps the inner error and adds scope; `label` drops the inner and emits a single `Expected <name>`.
